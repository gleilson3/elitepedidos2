/*
  # Create Store2 user password verification function

  1. New Functions
    - `verify_store2_user_password` - Securely verifies Store2 user passwords using bcrypt
  
  2. Security
    - Function is security definer to access password hashes safely
    - Grants execute permission to authenticated and anon users
    - Uses bcrypt for secure password comparison
*/

-- Create function to verify Store2 user passwords
CREATE OR REPLACE FUNCTION verify_store2_user_password(
  input_username TEXT,
  input_password TEXT
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
  FROM store2_users
  WHERE username = input_username AND is_active = true;
  
  -- If user not found, return false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Compare the provided password with the stored hash using crypt
  RETURN crypt(input_password, stored_hash) = stored_hash;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION verify_store2_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_store2_user_password(TEXT, TEXT) TO anon;