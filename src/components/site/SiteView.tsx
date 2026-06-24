import { buildPixPayload } from "@/lib/pix";
import { themeStyle } from "@/lib/themes";
import { PixCard } from "@/components/site/PixCard";
import { Countdown } from "@/components/site/Countdown";
import { Crest } from "@/components/site/Crest";
import { RsvpForm } from "@/components/site/RsvpForm";
import type { Gift, Rsvp, Wedding } from "@/lib/types";

const brl = (cents: number | null) =>
  cents == null ? "Valor livre" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function initials(wedding: Wedding): [string, string] {
  if (wedding.monogram_left || wedding.monogram_right)
    return [wedding.monogram_left || "", wedding.monogram_right || ""];
  const parts = (wedding.couple_names ?? "").split(/&| e /i).map((p) => p.trim()).filter(Boolean);
  return [parts[0]?.[0]?.toUpperCase() ?? "A", parts[1]?.[0]?.toUpperCase() ?? "B"];
}

const inkBg = { background: "linear-gradient(180deg, var(--ink), var(--ink-soft))" };

export function SiteView({
  wedding,
  gifts,
  rsvps,
  isPreview,
}: {
  wedding: Wedding;
  gifts: Gift[];
  rsvps: Rsvp[];
  isPreview: boolean;
}) {
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

  const [mLeft, mRight] = initials(wedding);
  const eventDate = wedding.event_date ? new Date(wedding.event_date) : null;
  const timeline = wedding.story_timeline ?? [];
  const schedule = wedding.schedule ?? [];
  const hasCeremony = wedding.ceremony && (wedding.ceremony.local || wedding.ceremony.endereco);
  const hasReception = wedding.show_reception && wedding.reception && (wedding.reception.local || wedding.reception.endereco);

  const confirmados = rsvps.filter((r) => r.attending);
  const totalPessoas = confirmados.reduce((acc, r) => acc + 1 + (r.companions || 0), 0);
  const recados = rsvps.filter((r) => r.message);

  const navLinks = [
    { href: "#historia", label: "História", show: timeline.length > 0 || !!wedding.story },
    { href: "#o-dia", label: "O Dia", show: !!hasCeremony || !!hasReception },
    { href: "#presenca", label: "Presença" },
    { href: "#presentes", label: "Presentes", show: hasPix && gifts.length > 0 },
  ].filter((l) => l.show !== false);

  return (
    <div className="scroll-smooth bg-background text-foreground" style={themeStyle(wedding.theme, wedding.custom_accent)}>
      {isPreview && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          Pré-visualização (rascunho) — só você vê esta página. Publique no painel para deixá-la pública.
        </div>
      )}

      {/* NAV */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-center gap-6 border-b px-6 py-3 backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--ink) 88%, transparent)", borderColor: "var(--ink-soft)" }}
      >
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--on-ink-soft)] transition hover:text-[var(--ink-accent)]"
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* HERO */}
      <header
        className="relative flex min-h-[88vh] flex-col items-center justify-center px-6 py-20 text-center"
        style={
          wedding.cover_photo_url
            ? {
                backgroundImage: `url(${wedding.cover_photo_url})`,
                backgroundSize: "cover",
                backgroundPosition: wedding.cover_position || "center",
              }
            : inkBg
        }
      >
        {wedding.cover_photo_url && <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,14,26,.55), rgba(8,14,26,.75))" }} />}
        <div className="relative flex flex-col items-center">
          <Crest left={mLeft} right={mRight} size={108} />
          <p className="mt-6 max-w-md text-[0.72rem] uppercase tracking-[0.34em] text-[var(--ink-accent)]">
            Com alegria, convidamos para o nosso casamento
          </p>
          <h1 className="mt-4 font-serif text-6xl font-medium leading-none text-[var(--on-ink)] sm:text-7xl">
            {wedding.couple_names ?? "Nosso Casamento"}
          </h1>
          <div className="my-7 h-px w-20" style={{ background: "linear-gradient(90deg,transparent,var(--ink-accent),transparent)" }} />
          {(eventDate || wedding.event_location) && (
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--on-ink-soft)]">
              {eventDate &&
                eventDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              {wedding.event_location ? ` · ${wedding.event_location}` : ""}
            </p>
          )}
          {eventDate && (
            <div className="mt-10">
              <Countdown targetISO={eventDate.toISOString()} />
            </div>
          )}
        </div>
      </header>

      {/* HISTÓRIA */}
      {(timeline.length > 0 || wedding.story) && (
        <section id="historia" className="scroll-mt-16 px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Nós dois</span>
            <h2 className="mt-3 font-serif text-4xl text-foreground">Nossa história</h2>
          </div>

          {timeline.length > 0 ? (
            <div className="relative mx-auto max-w-3xl">
              <span className="absolute left-4 top-0 h-full w-px -translate-x-1/2 bg-border sm:left-1/2" />
              <div className="space-y-10">
                {timeline.map((h, i) => {
                  const left = i % 2 === 0;
                  return (
                    <div key={i} className="relative pl-12 sm:grid sm:grid-cols-2 sm:gap-12 sm:pl-0">
                      <span className="absolute left-4 top-1.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-accent bg-background sm:left-1/2" />
                      <div className={left ? "sm:col-start-1 sm:pr-12 sm:text-right" : "sm:col-start-2 sm:pl-12 sm:text-left"}>
                        <span className="font-serif text-2xl italic text-accent">{h.ano}</span>
                        {h.titulo && <h3 className="mt-1 font-serif text-2xl text-foreground">{h.titulo}</h3>}
                        {h.texto && <p className="mt-2 leading-relaxed text-muted">{h.texto}</p>}
                        {h.imagem && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={h.imagem}
                            alt={h.titulo || h.ano || "Foto"}
                            className={`mt-4 block h-44 w-full max-w-xs rounded-xl object-cover shadow-sm ${left ? "sm:ml-auto" : "sm:mr-auto"}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mx-auto max-w-2xl whitespace-pre-line text-center leading-relaxed text-muted">
              {wedding.story}
            </p>
          )}
        </section>
      )}

      {/* O DIA */}
      {(hasCeremony || hasReception || (wedding.show_schedule && schedule.length > 0)) && (
        <section id="o-dia" className="scroll-mt-16 px-6 py-20 text-[var(--on-ink)]" style={inkBg}>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-[var(--ink-accent)]">Save the date</span>
            <h2 className="mt-3 font-serif text-4xl text-[var(--on-ink)]">O grande dia</h2>
            <p className="mt-3 italic text-[var(--on-ink-soft)]">Será uma alegria ter você ao nosso lado.</p>
          </div>

          {(hasCeremony || hasReception) && (
            <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
              {hasCeremony && <PlaceCard tag="Cerimônia" place={wedding.ceremony!} />}
              {hasReception && <PlaceCard tag="Recepção" place={wedding.reception!} />}
            </div>
          )}

          {wedding.show_schedule && schedule.length > 0 && (
            <div className="mx-auto mt-14 max-w-md">
              <p className="mb-6 text-center text-[0.7rem] uppercase tracking-[0.3em] text-[var(--ink-accent)]">
                Programação
              </p>
              <div className="space-y-1">
                {schedule.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 py-1.5">
                    <span className="min-w-[64px] text-right font-serif text-xl text-[var(--on-ink)]">{p.hora}</span>
                    <span className="h-px flex-1" style={{ background: "var(--ink-soft)" }} />
                    <span className="min-w-[150px] text-sm text-[var(--on-ink-soft)]">{p.evento}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wedding.dress_code && (
            <p className="mt-10 text-center italic text-[var(--ink-accent)]">✦ {wedding.dress_code}</p>
          )}
        </section>
      )}

      {/* PRESENÇA + MURAL */}
      <section id="presenca" className="scroll-mt-16 px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">R.S.V.P.</span>
          <h2 className="mt-3 font-serif text-4xl text-foreground">Confirme sua presença</h2>
          <p className="mt-3 italic text-muted">Deixe também um recadinho para os noivos 💌</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <RsvpForm weddingId={wedding.id} slug={wedding.slug} />
          </div>

          <div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <p className="font-serif text-3xl text-accent">{confirmados.length}</p>
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">confirmações</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <p className="font-serif text-3xl text-accent">{totalPessoas}</p>
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">pessoas</p>
              </div>
            </div>
            <p className="mb-3 text-[0.7rem] uppercase tracking-[0.26em] text-muted">Mural de recados</p>
            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
              {recados.length === 0 && <p className="text-sm italic text-muted">Seja o primeiro a deixar um recado.</p>}
              {recados.slice(0, 30).map((r) => (
                <div key={r.id} className="rounded-lg border border-border border-l-2 border-l-accent bg-surface p-3">
                  <p className="text-sm italic text-foreground">“{r.message}”</p>
                  <span className="mt-1 block text-xs text-accent">— {r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRESENTES */}
      {hasPix && (regularGifts.length > 0 || honeymoon.length > 0) && (
        <section id="presentes" className="scroll-mt-16 px-6 py-20 text-[var(--on-ink)]" style={inkBg}>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-[var(--ink-accent)]">Lista de presentes</span>
            <h2 className="mt-3 font-serif text-4xl text-[var(--on-ink)]">Nos ajude a construir o lar</h2>
            <p className="mt-3 text-[var(--on-ink-soft)]">
              Sua presença é o nosso maior presente. Se quiser nos presentear, é via <strong>PIX</strong>.
            </p>
          </div>

          {regularGifts.length > 0 && <GiftGroup title="Para o nosso lar" gifts={regularGifts} pixFor={pixFor} />}
          {honeymoon.length > 0 && <GiftGroup title="Para a nossa lua de mel ✈️" gifts={honeymoon} pixFor={pixFor} />}
        </section>
      )}

      {/* FOOTER */}
      <footer className="flex flex-col items-center px-6 py-16 text-center text-[var(--on-ink)]" style={{ background: "var(--ink)" }}>
        <Crest left={mLeft} right={mRight} size={84} />
        {wedding.verse && (
          <p className="mt-6 max-w-xl font-serif text-2xl italic text-[var(--on-ink)]">“{wedding.verse}”</p>
        )}
        {wedding.verse_ref && (
          <span className="mt-3 text-[0.7rem] uppercase tracking-[0.26em] text-[var(--ink-accent)]">{wedding.verse_ref}</span>
        )}
        <div className="my-7 h-px w-16" style={{ background: "var(--ink-accent)", opacity: 0.5 }} />
        <p className="font-serif text-2xl text-[var(--on-ink)]">{wedding.couple_names ?? "O casal"}</p>
        {eventDate && (
          <p className="mt-1 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--on-ink-soft)]">
            {eventDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        )}
      </footer>
    </div>
  );
}

/* ── Subcomponentes ───────────────────────────────────────────────────── */
function PlaceCard({ tag, place }: { tag: string; place: { local: string; endereco: string; horario: string; maps: string } }) {
  return (
    <div className="rounded-xl border p-7 text-center" style={{ borderColor: "var(--ink-soft)", background: "color-mix(in srgb, var(--on-ink) 4%, transparent)" }}>
      <span className="block text-[0.66rem] uppercase tracking-[0.3em] text-[var(--ink-accent)]">{tag}</span>
      {place.local && <h3 className="mt-3 font-serif text-2xl text-[var(--on-ink)]">{place.local}</h3>}
      {place.horario && <p className="mt-3 text-sm text-[var(--on-ink-soft)]">🕐 {place.horario}</p>}
      {place.endereco && <p className="mt-1 text-sm text-[var(--on-ink-soft)]">📍 {place.endereco}</p>}
      {place.maps && (
        <a href={place.maps} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b text-sm text-[var(--ink-accent)]" style={{ borderColor: "var(--ink-accent)" }}>
          Ver no mapa →
        </a>
      )}
    </div>
  );
}

function GiftGroup({
  title,
  gifts,
  pixFor,
}: {
  title: string;
  gifts: Gift[];
  pixFor: (amount: number | null) => string | null;
}) {
  return (
    <div className="mx-auto mb-10 max-w-4xl">
      <p className="mb-6 text-center text-[0.74rem] uppercase tracking-[0.28em] text-[var(--ink-accent)]">{title}</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-xl border p-5 text-center" style={{ borderColor: "var(--ink-soft)", background: "color-mix(in srgb, var(--on-ink) 4%, transparent)" }}>
            {g.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.image_url} alt={g.title} className="mb-4 h-36 w-full rounded-lg object-cover" />
            )}
            <h4 className="font-serif text-xl text-[var(--on-ink)]">{g.title}</h4>
            {g.description && <p className="mt-1 text-sm text-[var(--on-ink-soft)]">{g.description}</p>}
            <p className="mt-1 mb-4 text-[var(--ink-accent)]">{brl(g.suggested_amount)}</p>
            <div className="rounded-lg bg-white p-4">
              <PixCard payload={pixFor(g.suggested_amount)!} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
