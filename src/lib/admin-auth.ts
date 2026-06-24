import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Lista de e-mails admin a partir do .env (ADMIN_EMAILS, separados por vírgula). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True se o e-mail consta na lista de admins. */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

/**
 * Garante que há um usuário logado e que ele é admin. Caso contrário redireciona
 * para /painel (não-admin) ou /login (deslogado). Retorna o usuário autenticado.
 * Use no topo de Server Components e Server Actions do admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/painel");
  return user;
}
