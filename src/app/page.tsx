import Link from "next/link";
import { THEMES } from "@/lib/themes";
import {
  CONTACT_EMAIL,
  mailtoLink,
  whatsappDisplay,
  whatsappLink,
} from "@/lib/contact";

/** Preço da assinatura anual, formatado em BRL a partir do .env. */
function formatPrice(): string {
  const cents = Number(process.env.SUBSCRIPTION_PRICE_CENTS) || 9900;
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}

const FEATURES = [
  {
    title: "A história de vocês",
    desc: "Conte como tudo começou, com fotos e os momentos que marcaram o casal.",
    icon: HeartIcon,
  },
  {
    title: "Save the date & contagem",
    desc: "Data, local e um contador regressivo que deixa todo mundo na expectativa.",
    icon: CalendarIcon,
  },
  {
    title: "Confirmação de presença",
    desc: "Os convidados confirmam o RSVP pelo site e você acompanha tudo no painel.",
    icon: CheckIcon,
  },
  {
    title: "Lista de presentes",
    desc: "Monte sua lista e receba contribuições por PIX, direto na sua conta.",
    icon: GiftIcon,
  },
  {
    title: "Doação para a lua de mel",
    desc: "Deixe os convidados ajudarem na viagem dos sonhos com qualquer valor.",
    icon: PlaneIcon,
  },
  {
    title: "Temas elegantes",
    desc: "Seis paletas prontas ou sua própria cor — tudo combinando, do jeito de vocês.",
    icon: PaletteIcon,
  },
];

const STEPS = [
  {
    n: "1",
    title: "Crie sua conta",
    desc: "Entre com seu e-mail por um link mágico, sem senha para decorar.",
  },
  {
    n: "2",
    title: "Monte seu site",
    desc: "Preencha sua história, fotos, presentes e escolha o tema. Pré-visualize quando quiser.",
  },
  {
    n: "3",
    title: "Publique e compartilhe",
    desc: "Pague uma vez, receba seu link exclusivo e envie para todos os convidados.",
  },
];

const INCLUDED = [
  "Página pública com link exclusivo",
  "História, save the date e contagem regressiva",
  "Confirmação de presença (RSVP) ilimitada",
  "Lista de presentes com PIX",
  "Doação para a lua de mel",
  "6 temas + cor personalizada",
  "Painel para editar quando quiser",
  "Site no ar por 1 ano inteiro",
];

const FAQ = [
  {
    q: "Como funciona o pagamento?",
    a: "É um pagamento único via PIX. Depois de confirmado, seu site fica publicado por 1 ano — sem mensalidade e sem renovação automática.",
  },
  {
    q: "Eu recebo os presentes e doações?",
    a: "Sim. As contribuições dos convidados caem por PIX direto na sua conta. A plataforma é só para montar e hospedar o site.",
  },
  {
    q: "Posso editar depois de publicar?",
    a: "Pode, quando quiser. O painel fica disponível durante todo o período para você atualizar textos, fotos, presentes e a lista de confirmados.",
  },
  {
    q: "Preciso saber mexer com tecnologia?",
    a: "Não. Você preenche um formulário simples e o site fica pronto. Escolhe um tema e está tudo no ar.",
  },
];

export default function Home() {
  const price = formatPrice();

  return (
    <div className="bg-background text-foreground">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="letsgetmarried — página inicial">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG estático, sem otimização do next/image */}
            <img
              src="/logo-horizontal.svg"
              alt="letsgetmarried"
              width={180}
              height={40}
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
            >
              Criar meu site
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="text-center lg:text-left">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-accent sm:text-sm">
            Site de casamento
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
            O site do seu casamento, do jeito que vocês sonharam
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg lg:mx-0">
            Conte a história de vocês, divulgue o save the date, monte a lista de
            presentes e receba contribuições para a lua de mel — tudo em uma página
            linda para compartilhar com os convidados.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/login"
              className="w-full rounded-full bg-accent px-7 py-3 text-center font-medium text-white shadow-sm transition hover:bg-accent-hover sm:w-auto"
            >
              Criar meu site
            </Link>
            <Link
              href="#precos"
              className="w-full rounded-full border border-border bg-surface px-7 py-3 text-center font-medium text-foreground transition hover:border-accent sm:w-auto"
            >
              Ver preço
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Pague uma vez • {price} • Seu site no ar por 1 ano
          </p>
        </div>

        {/* Mockup / preview decorativo */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            className="overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-xl sm:p-10"
            style={
              {
                "--ink-accent": "#a8863f",
                "--on-ink": "#1e242c",
                "--font-display": "var(--font-serif)",
              } as React.CSSProperties
            }
          >
            <div className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG estático, sem otimização do next/image */}
              <img src="/logo-mark.svg" alt="" width={88} height={88} className="h-20 w-20" />
              <p className="mt-5 text-xs uppercase tracking-[0.3em] text-accent">
                Vamos nos casar
              </p>
              <p className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
                Ana &amp; Bruno
              </p>
              <p className="mt-2 text-sm text-muted">12 de Outubro de 2026 · São Paulo</p>
              <div className="mt-6 grid w-full grid-cols-4 gap-2">
                {[
                  ["111", "dias"],
                  ["06", "hrs"],
                  ["42", "min"],
                  ["18", "seg"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-accent-soft py-3">
                    <p className="font-serif text-xl text-foreground sm:text-2xl">{v}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted">{l}</p>
                  </div>
                ))}
              </div>
              <span className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white">
                Confirmar presença
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recursos ────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
              Tudo o que o seu casamento precisa
            </h2>
            <p className="mt-4 text-muted">
              Uma página completa, bonita e fácil de montar — pensada para emocionar
              quem você ama.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-background p-6 transition hover:border-accent hover:shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon />
                </span>
                <h3 className="mt-4 font-serif text-xl text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
            Pronto em três passos
          </h2>
          <p className="mt-4 text-muted">Do cadastro ao link no ar em poucos minutos.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="text-center md:text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-serif text-xl text-white mx-auto md:mx-0">
                {n}
              </span>
              <h3 className="mt-5 font-serif text-xl text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Temas ───────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
              Um tema para cada história
            </h2>
            <p className="mt-4 text-muted">
              Escolha entre seis paletas elegantes ou use a sua própria cor.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {THEMES.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-border bg-background p-4 text-center"
              >
                <div
                  className="mx-auto h-16 w-full rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${t.vars.ink} 0%, ${t.vars.accent} 100%)`,
                  }}
                />
                <p className="mt-3 text-sm font-medium text-foreground">{t.label}</p>
                <p className="mt-0.5 text-xs text-muted">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preço ───────────────────────────────────────────────── */}
      <section id="precos" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-md">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
            <div className="bg-accent px-8 py-8 text-center text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                Pagamento único
              </p>
              <p className="mt-3 font-serif text-5xl font-medium">{price}</p>
              <p className="mt-2 text-sm text-white/85">Seu site no ar por 1 ano</p>
            </div>
            <div className="px-8 py-8">
              <ul className="flex flex-col gap-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 shrink-0 text-accent">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 block w-full rounded-full bg-accent px-7 py-3 text-center font-medium text-white shadow-sm transition hover:bg-accent-hover"
              >
                Criar meu site agora
              </Link>
              <p className="mt-4 text-center text-xs text-muted">
                Sem mensalidade • Sem renovação automática • Pague com PIX
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h2 className="text-center font-serif text-3xl text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div className="mt-10 flex flex-col gap-4">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-border bg-background p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                  {q}
                  <span className="ml-4 shrink-0 text-accent transition group-open:rotate-45">
                    <PlusIcon />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="mx-auto max-w-2xl font-serif text-3xl text-foreground sm:text-4xl lg:text-5xl">
          Comece o site do seu casamento hoje
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-muted">
          Leva poucos minutos para montar e uma vida inteira para lembrar.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3 font-medium text-white shadow-sm transition hover:bg-accent-hover"
        >
          Criar meu site
        </Link>
      </section>

      {/* ── Contato ─────────────────────────────────────────────── */}
      <section id="contato" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
            Tem dúvidas? Fale com a gente
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Estamos por aqui antes, durante e depois — qualquer problema com o seu
            site, é só chamar.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={whatsappLink("Olá! Tenho uma dúvida sobre o letsgetmarried.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-accent px-7 py-3 text-center font-medium text-white shadow-sm transition hover:bg-accent-hover sm:w-auto"
            >
              WhatsApp · {whatsappDisplay()}
            </a>
            <a
              href={mailtoLink("Contato — letsgetmarried")}
              className="w-full rounded-full border border-border bg-background px-7 py-3 text-center font-medium text-foreground transition hover:border-accent sm:w-auto"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG estático, sem otimização do next/image */}
          <img
            src="/logo-horizontal.svg"
            alt="letsgetmarried"
            width={160}
            height={36}
            className="h-8 w-auto"
          />
          <p>© {new Date().getFullYear()} letsgetmarried. Feito com carinho.</p>
          <div className="flex items-center gap-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-foreground"
            >
              WhatsApp
            </a>
            <a href={mailtoLink()} className="transition hover:text-foreground">
              E-mail
            </a>
            <Link href="/login" className="transition hover:text-foreground">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Ícones (SVG inline, sem dependências) ───────────────────────── */
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function GiftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M5 12v9h14v-9" />
      <path d="M12 8S10.5 3 8 3a2 2 0 0 0 0 5h4ZM12 8s1.5-5 4-5a2 2 0 0 1 0 5h-4Z" />
    </svg>
  );
}
function PlaneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9.3l-.7.7a.5.5 0 0 0 .1.8L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.2 5.6a.5.5 0 0 0 .8.1l.7-.7a1 1 0 0 0 .3-.9Z" />
    </svg>
  );
}
function PaletteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 1 1 10-10c0 2-1.8 3-3.5 3H16a2 2 0 0 0-2 2c0 .5.2 1 .5 1.5.3.5.5 1 .5 1.5a2 2 0 0 1-3 2Z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
