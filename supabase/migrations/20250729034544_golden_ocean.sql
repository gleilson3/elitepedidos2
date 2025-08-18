/*
  # Create PDV Settings Table

  1. New Tables
    - `pdv_settings`
      - `id` (text, primary key) - Store identifier
      - `store_name` (text) - Name of the store
      - `printer_enabled` (boolean) - Whether printer is enabled
      - `scale_enabled` (boolean) - Whether scale is enabled
      - `auto_print` (boolean) - Whether auto-print is enabled
      - `sound_enabled` (boolean) - Whether system sounds are enabled
      - `paper_width` (text) - Paper width setting
      - `font_size` (integer) - Font size for printing
      - `scale_port` (text) - Serial port for scale
      - `scale_baud_rate` (integer) - Baud rate for scale communication
      - `created_at` (timestamp) - Creation timestamp
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on `pdv_settings` table
    - Add policy for all operations (public access for PDV settings)

  3. Default Data
    - Insert default settings for Loja 1
*/

CREATE TABLE IF NOT EXISTS pdv_settings (
  id text PRIMARY KEY DEFAULT 'loja1',
  store_name text NOT NULL DEFAULT 'Elite Açaí - Loja 1',
  printer_enabled boolean NOT NULL DEFAULT true,
  scale_enabled boolean NOT NULL DEFAULT true,
  auto_print boolean NOT NULL DEFAULT false,
  sound_enabled boolean NOT NULL DEFAULT true,
  paper_width text NOT NULL DEFAULT '80mm',
  font_size integer NOT NULL DEFAULT 14,
  scale_port text NOT NULL DEFAULT 'COM1',
  scale_baud_rate integer NOT NULL DEFAULT 4800,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE pdv_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on pdv_settings"
  ON pdv_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default settings for Loja 1
INSERT INTO pdv_settings (
  id,
  store_name,
  printer_enabled,
  scale_enabled,
  auto_print,
  sound_enabled,
  paper_width,
  font_size,
  scale_port,
  scale_baud_rate
) VALUES (
  'loja1',
  'Elite Açaí - Loja 1',
  true,
  true,
  false,
  true,
  '80mm',
  14,
  'COM1',
  4800
) ON CONFLICT (id) DO NOTHING;