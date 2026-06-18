import Link from "next/link";
import { signOut } from "./actions";

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/painel" className="font-semibold">
              Painel
            </Link>
            <Link href="/painel/editar" className="text-gray-600 hover:text-gray-900">
              Editar site
            </Link>
            <Link href="/painel/presentes" className="text-gray-600 hover:text-gray-900">
              Presentes
            </Link>
          </nav>
          <form action={signOut}>
            <button className="text-sm text-gray-500 hover:text-gray-900">Sair</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
