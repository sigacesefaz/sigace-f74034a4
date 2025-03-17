
-- This will create a cron job that runs daily to check if it's time to do the monthly process update
SELECT cron.schedule(
  'daily-process-update-check',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT net.http_post(
    url:='https://rhwtvaqsakxpumamnzgo.functions.supabase.co/scheduled-process-update',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUPABASE_SERVICE_ROLE_KEY"}',
    body:='{}'
  );
  $$
);
