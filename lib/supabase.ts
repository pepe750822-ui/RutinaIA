import { createClient } from "@supabase/supabase-js";

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  const env = getEnv();
  if (!env) return null;
  if (!client) {
    client = createClient(env.url, env.key);
  }
  return client;
}
