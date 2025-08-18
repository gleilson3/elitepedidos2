import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use environment variables from .env.example if not configured
const defaultUrl = 'https://afceshaeqqmbrtudlhwz.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY2VzaGFlcXFtYnJ0dWRsaHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2ODU3MTEsImV4cCI6MjA2MDI2MTcxMX0.-d9660Q-9wg89z0roOw4-czkWxq2fxdKOJX9SilKz2U';

const finalUrl = supabaseUrl || defaultUrl;
const finalKey = supabaseAnonKey || defaultKey;

if (!finalUrl || !finalKey) {
  console.warn('⚠️ Supabase environment variables not configured properly');
}
export const supabase = createClient(finalUrl, finalKey);