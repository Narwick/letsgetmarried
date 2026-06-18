import Link from "next/link";
import { getOrCreateWedding } from "./actions";
import { PublishButton } from "@/components/painel/PublishButton";
import type { Wedding } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function statusBadge(status: Wedding["status"]) {
  const map = {
    draft: { label: "Rascunho", cls: "bg-amber-100 text-amber-800" },
    published: { label: "Publicado", cls: "bg-green-100 text-green-800" },
    expired: { label: "Expirado", cls: "bg-red-100 text-red-800" },
  } as const;
  const s = map[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
  );
}

export default async function PainelHome() {
  const wedding = (await getOrCreateWedding()) as Wedding;
  const publicUrl = `${SITE_URL}/${wedding.slug}`;
  const isLive = wedding.status === "published" && wedding.expires_at
    ? new Date(wedding.expires_at) > new Date()
    : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Seu site de casamento</h1>
        {statusBadge(wedding.status)}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Endereço do site</p>
        <div className="mt-1 flex items-center gap-3">
          <Link href={`/${wedding.slug}`} className="font-medium text-blue-600 hover:underline">
            {publicUrl}
          </Link>
        </div>
        {isLive && wedding.expires_at && (
          <p className="mt-2 text-sm text-gray-500">
            Ativo até {new Date(wedding.expires_at).toLocaleDateString("pt-BR")}.
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/painel/editar"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-400"
        >
          <p className="font-medium">Editar conteúdo</p>
          <p className="text-sm text-gray-500">História, save the date, infos e dados PIX.</p>
        </Link>
        <Link
          href="/painel/presentes"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-400"
        >
          <p className="font-medium">Lista de presentes</p>
          <p className="text-sm text-gray-500">Presentes e fundo da lua de mel.</p>
        </Link>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        {isLive ? (
          <p className="text-sm text-green-700">
            🎉 Seu site está no ar! Compartilhe o link com os convidados.
          </p>
        ) : (
          <>
            <p className="mb-1 font-medium">Publicar site</p>
            <p className="mb-4 text-sm text-gray-500">
              Pague a assinatura anual via PIX para deixar seu site público por 1 ano.
            </p>
            <PublishButton weddingId={wedding.id} />
          </>
        )}
      </section>
    </div>
  );
}
