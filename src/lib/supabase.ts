import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdzubyervntssvlwscrq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Lld4SFgAd6oWo9WzHMhhUA_8nmzqgTp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
