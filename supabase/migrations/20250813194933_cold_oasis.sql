/*
  # Create password verification function for attendance users

  1. New Functions
    - `verify_attendance_user_password` - Securely verify attendance user passwords
    - Uses bcrypt to compare provided password with stored hash
    
  2. Security
    - Function runs with security definer privileges
    - Only returns boolean result, never exposes password hashes
    - Handles case where user doesn't exist gracefully
*/

-- Function to verify attendance user password
CREATE OR REPLACE FUNCTION verify_attendance_user_password(
  user_username TEXT,
  password_to_check TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the stored password hash for the user
  SELECT password_hash INTO stored_hash
  FROM attendance_users
  WHERE username = user_username AND is_active = true;
  
  -- If user not found, return false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Compare the provided password with the stored hash using crypt
  RETURN crypt(password_to_check, stored_hash) = stored_hash;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_attendance_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_attendance_user_password(TEXT, TEXT) TO anon;