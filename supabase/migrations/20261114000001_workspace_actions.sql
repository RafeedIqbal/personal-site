create function public.publicus_edit(p_id uuid, p_samples jsonb, p_snapshot jsonb, p_review text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w publicus_workspaces; records jsonb; sources jsonb;
begin
  select * into w from publicus_workspaces where id = p_id and expires_at > now() for update;
  if w.id is null then raise exception 'Workspace expired'; end if;
  records := w.state->'records'; sources := w.state->'sources';
  if p_samples is not null then
    select coalesce(jsonb_agg(v),'[]') into records from jsonb_array_elements(records) v where v->>'origin' <> 'sample';
    select coalesce(jsonb_agg(v),'[]') into sources from jsonb_array_elements(sources) v where v->>'origin' <> 'sample';
    records := records || (p_samples->'records'); sources := sources || (p_samples->'sources');
    -- A changed requirement invalidates prior human decisions. Preserve notes and saved items.
    w.state := w.state || jsonb_build_object('scenario', p_samples->>'scenario', 'reviewed', '{}'::jsonb,
      'saved', (select coalesce(jsonb_object_agg(key, case when value = 'Qualified' then 'In review' else value end),'{}') from jsonb_each_text(w.state->'saved')));
  end if;
  if p_snapshot is not null then
    select coalesce(jsonb_agg(v),'[]') into records from (select distinct on (v->>'id') v from jsonb_array_elements(records || (p_snapshot->'records')) v) r;
    select coalesce(jsonb_agg(v),'[]') into sources from (select distinct on (v->>'id') v from jsonb_array_elements(sources || (p_snapshot->'sources')) v) s;
  end if;
  if p_review is not null then
    if not exists (select 1 from jsonb_array_elements(records) r join jsonb_array_elements(sources) s on r->>'sourceId' = s->>'id' where r->>'id' = p_review) then raise exception 'Source unavailable'; end if;
    select jsonb_agg(case when v->>'id' = p_review then v || '{"needsReview":false}'::jsonb else v end) into records from jsonb_array_elements(records) v;
  end if;
  if jsonb_array_length(records) > 500 or jsonb_array_length(sources) > 500 then raise exception 'Workspace limit reached'; end if;
  w.state := w.state || jsonb_build_object('records', records, 'sources', sources);
  update publicus_workspaces set state = w.state where id = p_id;
  return w.state;
end $$;
revoke all on function public.publicus_edit(uuid,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.publicus_edit(uuid,jsonb,jsonb,text) to service_role;
