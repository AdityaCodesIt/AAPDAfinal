import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqqcljeuduoutkywpjnf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNsamV1ZHVvdXRreXdwam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTU3NDgsImV4cCI6MjA5MjQ5MTc0OH0.nyZuo1eIIMczWrFM6CYBv3kN18NBQa5veCpDRTKOJS8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
