import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  environment.supabase.url,
  environment.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'ec-auth-token',
    },
  }
);
