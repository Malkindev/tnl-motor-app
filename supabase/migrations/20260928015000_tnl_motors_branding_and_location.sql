-- TNL Motors branding and Kilifi location update
-- Keep public site branding and contact location aligned with the requested TNL Motors identity.
INSERT INTO public.website_settings (key, value) VALUES
  ('company_name','TNL Motors'),
  ('address','Kilifi Mtondia Trading Center')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();
