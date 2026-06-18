import Link from "next/link";
import { signOut } from "./actions";

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/painel" className="font-serif text-lg text-foreground">
              Nosso Casamento
            </Link>
            <Link href="/painel/editar" className="text-muted transition hover:text-accent">
              Editar site
            </Link>
            <Link href="/painel/presentes" className="text-muted transition hover:text-accent">
              Presentes
            </Link>
          </nav>
          <form action={signOut}>
            <button className="text-sm text-muted transition hover:text-accent">Sair</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
