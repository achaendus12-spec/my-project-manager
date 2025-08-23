import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jcbhwhcwgneovrogdgpj.supabase.co";   // ganti dengan project URL kamu
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjYmh3aGN3Z25lb3Zyb2dkZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzI0MjcsImV4cCI6MjA3MTEwODQyN30.uP3bBUk6c8vvqmoZT7SMGDr-qruvoQXrDBw0-4wL4fs";       // ganti dengan anon key kamu

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);