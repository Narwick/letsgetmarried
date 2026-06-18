import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPixPayload } from "@/lib/pix";
import { PixCard } from "@/components/site/PixCard";
import type { Gift, Wedding } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Busca o casamento publicado e não expirado. */
async function getPublishedWedding(slug: string): Promise<Wedding | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return (data as Wedding) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getPublishedWedding(slug);
  if (!wedding) return { title: "Site não encontrado" };
  return {
    title: wedding.couple_names ? `${wedding.couple_names} — Casamento` : "Nosso Casamento",
    description: wedding.story?.slice(0, 150) ?? undefined,
  };
}

function brl(cents: number | null): string {
  if (cents == null) return "Valor livre";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PublicSite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wedding = await getPublishedWedding(slug);
  if (!wedding) notFound();

  const supabase = createAdminClient();
  const { data: giftsData } = await supabase
    .from("gifts")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true });
  const gifts = (giftsData ?? []) as Gift[];

  const honeymoon = gifts.filter((g) => g.is_honeymoon_fund);
  const regularGifts = gifts.filter((g) => !g.is_honeymoon_fund);
  const hasPix = Boolean(wedding.pix_key && wedding.pix_recipient_name && wedding.pix_city);

  const pixFor = (amount: number | null) =>
    hasPix
      ? buildPixPayload({
          pixKey: wedding.pix_key!,
          recipientName: wedding.pix_recipient_name!,
          city: wedding.pix_city!,
          amountCents: amount,
        })
      : null;

  const eventDate = wedding.event_date ? new Date(wedding.event_date) : null;

  return (
    <div className="bg-stone-50 text-stone-800">
      {/* Hero */}
      <section
        className="flex min-h-[60vh] flex-col items-center justify-center bg-cover bg-center px-6 py-20 text-center"
        style={
          wedding.cover_photo_url
            ? { backgroundImage: `url(${wedding.cover_photo_url})` }
            : undefined
        }
      >
        <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
          {wedding.couple_names ?? "Nosso Casamento"}
        </h1>
        {eventDate && (
          <p className="mt-4 text-lg">
            {eventDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </section>

      {/* História */}
      {wedding.story && (
        <section className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="mb-6 text-2xl font-light">Nossa história</h2>
          <p className="whitespace-pre-line leading-relaxed text-stone-600">{wedding.story}</p>
        </section>
      )}

      {/* Save the date / informações */}
      {(eventDate || wedding.event_location || wedding.event_details) && (
        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-2xl font-light">Save the date</h2>
            {eventDate && (
              <p className="text-lg">
                {eventDate.toLocaleString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {wedding.event_location && <p className="mt-2 text-stone-600">{wedding.event_location}</p>}
            {wedding.event_details && (
              <p className="mt-4 whitespace-pre-line text-sm text-stone-500">{wedding.event_details}</p>
            )}
          </div>
        </section>
      )}

      {/* Lista de presentes */}
      {regularGifts.length > 0 && hasPix && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-light">Lista de presentes</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {regularGifts.map((g) => (
              <div key={g.id} className="rounded-xl border border-stone-200 bg-white p-6">
                <p className="font-medium">{g.title}</p>
                {g.description && <p className="mb-3 text-sm text-stone-500">{g.description}</p>}
                <p className="mb-4 text-sm text-stone-600">{brl(g.suggested_amount)}</p>
                <PixCard payload={pixFor(g.suggested_amount)!} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fundo da lua de mel */}
      {hasPix && (
        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-2 text-2xl font-light">Ajude na nossa lua de mel ✈️</h2>
            <p className="mb-8 text-stone-600">
              Contribua com qualquer valor via PIX para a nossa viagem.
            </p>
            {honeymoon.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {honeymoon.map((g) => (
                  <div key={g.id} className="rounded-xl border border-stone-200 p-6">
                    <p className="font-medium">{g.title}</p>
                    {g.description && <p className="mb-3 text-sm text-stone-500">{g.description}</p>}
                    <p className="mb-4 text-sm text-stone-600">{brl(g.suggested_amount)}</p>
                    <PixCard payload={pixFor(g.suggested_amount)!} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-xs">
                <PixCard payload={pixFor(null)!} />
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="px-6 py-10 text-center text-sm text-stone-400">
        Feito com ❤️ para {wedding.couple_names ?? "o casal"}.
      </footer>
    </div>
  );
}
