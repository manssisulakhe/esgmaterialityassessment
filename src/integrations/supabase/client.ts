import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qcanlkggiyuyumpywppm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYW5sa2dnaXl1eXVtcHl3cHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNzY4NjcsImV4cCI6MjA4NDY1Mjg2N30.P-nKLgAmukO2yGijVJ49b5Q_Wij1H_n_cpW1OfDzYOw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
