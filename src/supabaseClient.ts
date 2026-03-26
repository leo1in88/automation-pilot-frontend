import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ycfizdrmbtpdeodwkoaj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZml6ZHJtYnRwZGVvZHdrb2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTI2MTEsImV4cCI6MjA4OTU2ODYxMX0.l1OMvYvdtvT6sSYw-93kC-92_7ByQuFKLtrgQnYey1s';

export const supabase = createClient(supabaseUrl, supabaseKey);
