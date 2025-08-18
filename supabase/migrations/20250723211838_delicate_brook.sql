/*
  # Create Store 2 Database Tables

  1. New Tables
    - `store2_settings`
      - `id` (text, primary key, default 'loja2')
      - `store_name` (text)
      - `phone` (text)
      - `cnpj` (text)
      - `address` (text)
      - `is_open_now` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `store2_hours`
      - `id` (uuid, primary key)
      - `day_of_week` (integer, 0-6)
      - `is_open` (boolean)
      - `open_time` (time)
      - `close_time` (time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since it's internal system)

  3. Triggers
    - Auto-update `updated_at` timestamp
*/

-- Create store2_settings table
CREATE TABLE IF NOT EXISTS store2_settings (
  id text PRIMARY KEY DEFAULT 'loja2',
  store_name text NOT NULL DEFAULT 'Elite Açaí - Loja 2',
  phone text NOT NULL DEFAULT '(85) 98904-1010',
  cnpj text DEFAULT '00.000.000/0001-00',
  address text NOT NULL DEFAULT 'Rua Um, 1614-C – Residencial 1 – Cágado',
  is_open_now boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store2_hours table
CREATE TABLE IF NOT EXISTS store2_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean NOT NULL DEFAULT true,
  open_time time NOT NULL DEFAULT '16:00:00',
  close_time time NOT NULL DEFAULT '23:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Enable Row Level Security
ALTER TABLE store2_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal system)
CREATE POLICY "Allow all operations on store2_settings"
  ON store2_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on store2_hours"
  ON store2_hours
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_store2_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_store2_settings_updated_at
  BEFORE UPDATE ON store2_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store2_updated_at_column();

CREATE TRIGGER update_store2_hours_updated_at
  BEFORE UPDATE ON store2_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_store2_updated_at_column();

-- Insert default store2_settings
INSERT INTO store2_settings (id, store_name, phone, cnpj, address, is_open_now)
VALUES (
  'loja2',
  'Elite Açaí - Loja 2',
  '(85) 98904-1010',
  '00.000.000/0001-00',
  'Rua Um, 1614-C – Residencial 1 – Cágado',
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert default store2_hours (16:00 to 23:00 all days)
INSERT INTO store2_hours (day_of_week, is_open, open_time, close_time)
VALUES 
  (0, true, '16:00:00', '23:00:00'), -- Sunday
  (1, true, '16:00:00', '23:00:00'), -- Monday
  (2, true, '16:00:00', '23:00:00'), -- Tuesday
  (3, true, '16:00:00', '23:00:00'), -- Wednesday
  (4, true, '16:00:00', '23:00:00'), -- Thursday
  (5, true, '16:00:00', '23:00:00'), -- Friday
  (6, true, '16:00:00', '23:00:00')  -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store2_hours_day_of_week ON store2_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_store2_hours_is_open ON store2_hours(is_open);