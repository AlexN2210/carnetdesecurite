import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqckzyubenfsjmopvtok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2t6eXViZW5mc2ptb3B2dG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTk2NTQsImV4cCI6MjA3MzMzNTY1NH0.agVhTsVGc-fggAjNPteSSOrhViV5vLa65OHaWdHQbIk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
