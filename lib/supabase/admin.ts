import { createClient } from "@supabase/supabase-js";

import { isServiceRoleConfigured, publicEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  if (!isServiceRoleConfigured()) {
    throw new Error("Supabase service role configuration is missing.");
  }

  return createClient(publicEnv.supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
