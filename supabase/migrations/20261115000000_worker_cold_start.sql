-- Hosted cold starts can exceed one second. The endpoint acknowledges before
-- processing; allow enough time for that acknowledgement without losing jobs.
select cron.schedule('publicus-worker', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'publicus_worker_url'),
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Worker-Secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'publicus_worker_secret')),
    body := '{"scheduled":true}'::jsonb, timeout_milliseconds := 10000)
  where exists (select 1 from vault.decrypted_secrets where name = 'publicus_worker_url')
    and exists (select 1 from vault.decrypted_secrets where name = 'publicus_worker_secret');
$$);
