
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jyfgywereyngczfpsyny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Zmd5d2VyZXluZ2N6ZnBzeW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzk3MjYsImV4cCI6MjA1NzY1NTcyNn0.rQ4zKb0JON0A8Fv4vZkt6Qbw5IIoPaaTwb5uGr5htPY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
