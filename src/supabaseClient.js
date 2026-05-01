import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isixehzuwsnsohkiaxkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXhlaHp1d3Nuc29oa2lheGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc4NjIsImV4cCI6MjA5MjM3Mzg2Mn0.iZsR31AcYw9JGdbjAoQTD4KJYP4rvWzRJi0_swUZqqg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
