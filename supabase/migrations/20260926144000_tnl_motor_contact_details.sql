-- TNL Motor production contact details
-- Keep these values centralized in website_settings so Header/Footer/pages consume one source of truth.
INSERT INTO public.website_settings (key, value) VALUES
  ('company_name','TNL Motor'),
  ('phone','+254 101103530'),
  ('whatsapp','+254101103530'),
  ('email','tnlmotors4@gmail.com')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();