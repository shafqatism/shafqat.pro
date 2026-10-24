-- Booking form asks for an optional "other contact" (LinkedIn, Telegram, Zoom ID…) instead of company,
-- and offers a richer list of meeting topics.
alter table public.bookings add column if not exists other_contact text check (char_length(other_contact) <= 300);

update public.site_settings set data = jsonb_set(data, '{booking,meetingTypes}', '["Discovery Call","Software Architecture Review","Custom Software & Backend Development","Website & Web App Development","Shopify & E-Commerce Store","Mobile App Development (iOS / Android)","SaaS / MVP Development","Cloud, DevOps & Infrastructure","ERP & Business Automation","Product Strategy & Technical Consulting","Existing Project Support / Rescue","Partnership / Something Else"]'::jsonb) where id = 1;
