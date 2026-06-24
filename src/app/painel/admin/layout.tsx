import { requireAdmin } from "@/lib/admin-auth";

/** Protege todas as rotas /painel/admin: só admins (ADMIN_EMAILS) passam. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
