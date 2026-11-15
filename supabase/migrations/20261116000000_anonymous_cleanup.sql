-- Help-chat visitors sign in anonymously but never create a workspace, so the workspace
-- purge never deletes them and they pile up in auth.users. Remove them after seven days,
-- in bounded batches, from the worker's cleanup pass. Deleting the auth user cascades to
-- its identities and sessions; a returning browser signs in again on its next 401.
create function public.publicus_purge_anonymous(p_limit int default 100) returns int
language sql security definer set search_path = '' as $$
  with doomed as (
    select u.id from auth.users u
    where u.is_anonymous
      and u.created_at < now() - interval '7 days'
      and not exists (select 1 from public.publicus_workspaces w where w.owner_id = u.id)
    order by u.created_at
    limit greatest(1, least(p_limit, 500))
  ), removed as (
    delete from auth.users u using doomed d where u.id = d.id returning 1
  )
  select count(*)::int from removed;
$$;
revoke all on function public.publicus_purge_anonymous(int) from public, anon, authenticated;
grant execute on function public.publicus_purge_anonymous(int) to service_role;
