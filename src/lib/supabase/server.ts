import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client do Supabase para Server Components / Route Handlers, respeitando a
 * sessão do usuário logado (RLS aplicado como o usuário autenticado).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component — ignorável quando há middleware
            // cuidando da renovação da sessão.
          }
        },
      },
    },
  );
}
