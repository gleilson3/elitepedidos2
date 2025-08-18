@@ .. @@
 -- Enable RLS on attendance_users table
 ALTER TABLE attendance_users ENABLE ROW LEVEL SECURITY;
 
+-- Drop existing policies if they exist
+DROP POLICY IF EXISTS "Allow all operations on attendance_users" ON attendance_users;
+DROP POLICY IF EXISTS "Allow authenticated full access to attendance_users" ON attendance_users;
+DROP POLICY IF EXISTS "Allow public delete to attendance_users" ON attendance_users;
+DROP POLICY IF EXISTS "Allow public insert to attendance_users" ON attendance_users;
+DROP POLICY IF EXISTS "Allow public read access to attendance_users" ON attendance_users;
+DROP POLICY IF EXISTS "Allow public update to attendance_users" ON attendance_users;
+
 -- Create comprehensive policies for attendance_users
 CREATE POLICY "Enable all operations for attendance_users"
   ON attendance_users