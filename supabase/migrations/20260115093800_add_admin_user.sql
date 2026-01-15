-- Create or ensure the admin user exists and has the admin role
DO $$
DECLARE
  _user_id uuid;
BEGIN
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = 'djdlzl93@gmail.com';

  IF _user_id IS NULL THEN
    SELECT auth.admin.create_user(
      email => 'djdlzl93@gmail.com',
      password => 'password',
      email_confirm => true
    ) INTO _user_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin');
  END IF;
END $$;
