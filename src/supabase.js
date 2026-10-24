// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vrbjhdjxzghppfyppatr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmpoZGp4emdocHBmeXBwYXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MDczNjQsImV4cCI6MjEwODM4MzM2NH0.nas06l0T_bJE_29sXdTTu2-_ESp4FYFe0QTlgz_vIXE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);