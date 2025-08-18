/*
  # Create Store2 password verification function

  1. New Functions
    - `verify_store2_user_password` - Securely verifies Store2 user passwords using bcrypt
    - Returns user data if credentials are valid, null otherwise

  2. Security
    - Password verification happens server-side
    - No password hashes exposed to client
    - Uses bcrypt for secure password comparison
*/

-- Create function to verify Store2 user passwords securely
CREATE OR REPLACE FUNCTION verify_store2_user_password(
  p_username text,
  p_password_to_check text
)
RETURNS TABLE(
  id uuid,
  username text,
  name text,
  role text,
  is_active boolean,
  permissions jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  last_login timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record record;
BEGIN
  -- Get user record with password hash
  SELECT 
    u.id,
    u.username,
    u.password_hash,
    u.name,
    u.role,
    u.is_active,
    u.permissions,
    u.created_at,
    u.updated_at,
    u.last_login
  INTO user_record
  FROM store2_users u
  WHERE u.username = p_username
    AND u.is_active = true;

  -- Check if user exists and password matches
  IF user_record.id IS NOT NULL AND 
     crypt(p_password_to_check, user_record.password_hash) = user_record.password_hash THEN
    
    -- Update last login
    UPDATE store2_users 
    SET last_login = now()
    WHERE store2_users.id = user_record.id;
    
    -- Return user data (without password hash)
    RETURN QUERY
    SELECT 
      user_record.id,
      user_record.username,
      user_record.name,
      user_record.role,
      user_record.is_active,
      user_record.permissions,
      user_record.created_at,
      user_record.updated_at,
      now() as last_login;
  END IF;
  
  -- Return nothing if credentials are invalid
  RETURN;
END;
$$;