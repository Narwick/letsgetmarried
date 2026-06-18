import { createClient } from "@supabase/supabase-js";

/**
 * Client com service-role. Ignora RLS — use SOMENTE no servidor:
 *  - leitura do site público (filtrando por status/expiração na query);
 *  - webhook da AbacatePay (publicar site após pagamento).
 * NUNCA importe isto em código client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
