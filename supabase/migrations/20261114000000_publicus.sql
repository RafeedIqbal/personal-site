-- Dedicated application-demo project. No existing portfolio/customer tables are used.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table public.publicus_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (octet_length(state::text) <= 4000000),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  unique (owner_id)
);
create table public.publicus_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.publicus_workspaces(id) on delete cascade,
  kind text not null check (kind in ('feed', 'file', 'ask')),
  input jsonb not null check (octet_length(input::text) <= 200000),
  idempotency_key text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'complete', 'failed')),
  progress text not null default 'Waiting for a worker',
  attempts int not null default 0,
  lease_until timestamptz,
  lease_token uuid,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);
create index publicus_queue on public.publicus_runs(status, lease_until, created_at);
create table public.publicus_quota (
  scope text not null,
  day date not null default current_date,
  used int not null default 0,
  primary key (scope, day)
);

alter table public.publicus_workspaces enable row level security;
alter table public.publicus_runs enable row level security;
alter table public.publicus_quota enable row level security;
create policy own_workspace on public.publicus_workspaces for select to authenticated
  using (owner_id = (select auth.uid()) and expires_at > now());
create policy own_runs on public.publicus_runs for select to authenticated
  using (exists (select 1 from public.publicus_workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()) and w.expires_at > now()));
revoke all on public.publicus_workspaces, public.publicus_runs, public.publicus_quota from anon, authenticated;
grant select on public.publicus_workspaces, public.publicus_runs to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('publicus-documents', 'publicus-documents', false, 10485760,
  array['application/pdf','text/plain','text/csv','application/csv','application/vnd.ms-excel'])
on conflict (id) do nothing;
-- Uploads use one-use signed upload URLs issued by the authenticated API.
create policy own_documents on storage.objects for select to authenticated
  using (bucket_id = 'publicus-documents' and exists (
    select 1 from public.publicus_workspaces w where w.owner_id = (select auth.uid())
    and w.expires_at > now() and (storage.foldername(name))[1] = w.owner_id::text
    and (storage.foldername(name))[2] = w.id::text));

-- All writes go through the authenticated Edge API or a service-only worker.
-- Row locks protect quota reservations and state merges from concurrent requests.
create function public.publicus_reserve(p_scope text, p_limit int) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into publicus_quota(scope, used) values (p_scope, 0) on conflict do nothing;
  update publicus_quota set used = used + 1
    where scope = p_scope and day = current_date and used < p_limit returning used into n;
  return n is not null;
end $$;

create function public.publicus_patch(p_id uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  update publicus_workspaces set state = state || p_patch
  where id = p_id and expires_at > now() returning state into result;
  if result is null then raise exception 'Workspace expired'; end if;
  return result;
end $$;

create function public.publicus_claim() returns setof public.publicus_runs
language plpgsql security definer set search_path = public as $$
declare chosen uuid;
begin
  update publicus_runs set status = 'failed', error = 'Worker retry limit reached', progress = 'Needs retry'
    where status = 'processing' and lease_until < now() and attempts >= 3;
  select r.id into chosen from publicus_runs r join publicus_workspaces w on w.id = r.workspace_id
    where w.expires_at > now() and r.attempts < 3 and
      (r.status = 'queued' or (r.status = 'processing' and r.lease_until < now()))
    order by r.created_at for update of r skip locked limit 1;
  return query update publicus_runs set status = 'processing', attempts = attempts + 1,
    lease_until = now() + interval '120 seconds', lease_token = gen_random_uuid(),
    progress = 'Reading source', updated_at = now() where id = chosen returning *;
end $$;

create function public.publicus_finish(p_run uuid, p_token uuid, p_records jsonb, p_sources jsonb, p_answer jsonb, p_progress text)
returns boolean language plpgsql security definer set search_path = public as $$
declare job publicus_runs; w publicus_workspaces; merged_records jsonb; merged_sources jsonb;
begin
  select * into job from publicus_runs where id = p_run for update;
  if job.status <> 'processing' or job.lease_token <> p_token or job.lease_until < now() then return false; end if;
  select * into w from publicus_workspaces where id = job.workspace_id and expires_at > now() for update;
  if w.id is null then return false; end if;
  select coalesce(jsonb_agg(v), '[]') into merged_records from (
    select distinct on (v->>'id') v from jsonb_array_elements(coalesce(w.state->'records', '[]') || p_records) with ordinality as a(v,n)
    order by v->>'id', n desc
  ) r;
  select coalesce(jsonb_agg(v), '[]') into merged_sources from (
    select distinct on (v->>'id') v from jsonb_array_elements(coalesce(w.state->'sources', '[]') || p_sources) with ordinality as a(v,n)
    order by v->>'id', n desc
  ) s;
  if jsonb_array_length(merged_records) > 500 or jsonb_array_length(merged_sources) > 500 then
    raise exception 'Workspace record limit reached; reset the workspace to import more';
  end if;
  update publicus_workspaces set state = state || jsonb_build_object('records', merged_records, 'sources', merged_sources,
    'answers', case when p_answer is null then coalesce(state->'answers','[]') else
      (select coalesce(jsonb_agg(v order by n),'[]') from (select v,n from jsonb_array_elements(coalesce(state->'answers','[]') || jsonb_build_array(p_answer)) with ordinality as a(v,n) order by n desc limit 20) q) end)
    where id = w.id;
  update publicus_runs set status = 'complete', progress = p_progress, error = null, lease_until = null,
    updated_at = now() where id = p_run;
  return true;
end $$;

revoke all on function public.publicus_reserve(text,int), public.publicus_patch(uuid,jsonb), public.publicus_claim(), public.publicus_finish(uuid,uuid,jsonb,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.publicus_reserve(text,int), public.publicus_patch(uuid,jsonb), public.publicus_claim(), public.publicus_finish(uuid,uuid,jsonb,jsonb,jsonb,text) to service_role;

-- Configure the two Vault values after deployment; absent values make the job a no-op.
select cron.schedule('publicus-worker', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'publicus_worker_url'),
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Worker-Secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'publicus_worker_secret')),
    body := '{"scheduled":true}'::jsonb, timeout_milliseconds := 1000)
  where exists (select 1 from vault.decrypted_secrets where name = 'publicus_worker_url')
    and exists (select 1 from vault.decrypted_secrets where name = 'publicus_worker_secret');
$$);
