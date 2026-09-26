-- Make the existing TNL Motor administrator account an admin in production.
-- The password stays in Supabase Auth and is never stored in application code.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(trim(email)) = 'tnlmotors4@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Preserve the same behavior for this specific administrator email if the account
-- is recreated in the future, while all other signups remain customers.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE
      WHEN lower(trim(NEW.email)) = 'tnlmotors4@gmail.com'
        THEN 'admin'::public.app_role
      ELSE 'customer'::public.app_role
    END
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;