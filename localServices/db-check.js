/* global process */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: bids } = await supabase.from('bids').select('*').limit(1);
  console.log('bids data:', JSON.stringify(bids?.[0] || 'empty', null, 2));
}

check();
