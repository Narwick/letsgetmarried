import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildPixPayload } from "@/lib/pix";
import { themeStyle } from "@/lib/themes";
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

/**
 * Resolve o casamento a exibir:
 *  - se publicado e no prazo → site público;
 *  - senão, se o usuário logado for o dono → preview do rascunho.
 */
async function resolveWedding(
  slug: string,
): Promise<{ wedding: Wedding | null; isPreview: boolean }> {
  const published = await getPublishedWedding(slug);
  if (published) return { wedding: published, isPreview: false };

  // Fallback: preview para o dono logado (respeita RLS).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { wedding: null, isPreview: false };

  const { data } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  return data ? { wedding: data as Wedding, isPreview: true } : { wedding: null, isPreview: false };
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
  const { wedding, isPreview } = await resolveWedding(slug);
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
    <div className="bg-background text-foreground" style={themeStyle(wedding.theme)}>
      {isPreview && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          Pré-visualização (rascunho) — só você vê esta página. Publique no painel para
          deixá-la pública.
        </div>
      )}
      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] flex-col items-center justify-center bg-cover bg-center px-6 py-20 text-center"
        style={
          wedding.cover_photo_url
            ? { backgroundImage: `url(${wedding.cover_photo_url})` }
            : undefined
        }
      >
        {wedding.cover_photo_url && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div
          className={`relative ${wedding.cover_photo_url ? "text-white" : "text-foreground"}`}
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] opacity-80">
            Vamos nos casar
          </p>
          <h1 className="font-serif text-5xl font-medium tracking-wide sm:text-7xl">
            {wedding.couple_names ?? "Nosso Casamento"}
          </h1>
          {eventDate && (
            <p className="mt-5 text-lg tracking-wide">
              {eventDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </section>

      {/* História */}
      {wedding.story && (
        <section className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="mb-6 font-serif text-3xl text-foreground">Nossa história</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted">{wedding.story}</p>
        </section>
      )}

      {/* Save the date / informações */}
      {(eventDate || wedding.event_location || wedding.event_details) && (
        <section className="bg-surface px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 font-serif text-3xl text-foreground">Save the date</h2>
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
            {wedding.event_location && <p className="mt-2 text-muted">{wedding.event_location}</p>}
            {wedding.event_details && (
              <p className="mt-4 whitespace-pre-line text-sm text-muted">{wedding.event_details}</p>
            )}
          </div>
        </section>
      )}

      {/* Lista de presentes */}
      {regularGifts.length > 0 && hasPix && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-8 text-center font-serif text-3xl text-foreground">Lista de presentes</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {regularGifts.map((g) => (
              <div key={g.id} className="rounded-2xl border border-border bg-surface p-6">
                <p className="font-medium text-foreground">{g.title}</p>
                {g.description && <p className="mb-3 text-sm text-muted">{g.description}</p>}
                <p className="mb-4 text-sm text-muted">{brl(g.suggested_amount)}</p>
                <PixCard payload={pixFor(g.suggested_amount)!} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fundo da lua de mel */}
      {hasPix && (
        <section className="bg-surface px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-2 font-serif text-3xl text-foreground">Ajude na nossa lua de mel ✈️</h2>
            <p className="mb-8 text-muted">
              Contribua com qualquer valor via PIX para a nossa viagem.
            </p>
            {honeymoon.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {honeymoon.map((g) => (
                  <div key={g.id} className="rounded-2xl border border-border p-6">
                    <p className="font-medium text-foreground">{g.title}</p>
                    {g.description && <p className="mb-3 text-sm text-muted">{g.description}</p>}
                    <p className="mb-4 text-sm text-muted">{brl(g.suggested_amount)}</p>
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

      <footer className="px-6 py-10 text-center text-sm text-muted">
        Feito com ❤️ para {wedding.couple_names ?? "o casal"}.
      </footer>
    </div>
  );
}
