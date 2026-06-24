import Link from "next/link";
import { signOut } from "./actions";
import { HelpButton } from "@/components/HelpButton";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/painel" aria-label="letsgetmarried — painel">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG estático, sem otimização do next/image */}
              <img
                src="/logo-horizontal.svg"
                alt="letsgetmarried"
                width={150}
                height={33}
                className="h-7 w-auto"
              />
            </Link>
            <Link href="/painel/editar" className="text-muted transition hover:text-accent">
              Editar site
            </Link>
            <Link href="/painel/presentes" className="text-muted transition hover:text-accent">
              Presentes
            </Link>
            <Link href="/painel/confirmacoes" className="text-muted transition hover:text-accent">
              Confirmações
            </Link>
            {isAdmin && (
              <Link href="/painel/admin" className="text-accent transition hover:text-accent-hover">
                Admin
              </Link>
            )}
          </nav>
          <form action={signOut}>
            <button className="text-sm text-muted transition hover:text-accent">Sair</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
      <HelpButton />
    </div>
  );
}
