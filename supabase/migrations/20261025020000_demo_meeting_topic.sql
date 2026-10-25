-- Adds the "Ready-to-Use Software Demo" topic (linked from /products) to the booking topics, before the catch-all last topic.
update public.site_settings set data = jsonb_set(data, '{booking,meetingTypes}', (
  (data #> '{booking,meetingTypes}') - 'Partnership / Something Else') || '["Ready-to-Use Software Demo","Partnership / Something Else"]'::jsonb
) where id = 1 and not (data #> '{booking,meetingTypes}') ? 'Ready-to-Use Software Demo';
