"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crest } from "@/components/site/Crest";

type Phase = "closed" | "opening" | "open";

// Posições fixas (determinísticas p/ não quebrar a hidratação) das partículas
// de brilho que flutuam no fundo.
const SPARKLES = [
  { top: "14%", left: "16%", delay: "0s", size: 3 },
  { top: "22%", left: "80%", delay: ".6s", size: 2 },
  { top: "34%", left: "30%", delay: "1.2s", size: 4 },
  { top: "40%", left: "68%", delay: ".3s", size: 2 },
  { top: "12%", left: "52%", delay: "1.8s", size: 2 },
  { top: "58%", left: "20%", delay: ".9s", size: 3 },
  { top: "62%", left: "84%", delay: "1.5s", size: 2 },
  { top: "70%", left: "44%", delay: ".2s", size: 3 },
  { top: "78%", left: "72%", delay: "1.1s", size: 2 },
  { top: "84%", left: "30%", delay: ".7s", size: 4 },
  { top: "48%", left: "50%", delay: "1.4s", size: 2 },
  { top: "28%", left: "60%", delay: "2s", size: 3 },
];

/** Ornamento de filigrana dourada para os cantos da moldura. */
function CornerFlourish({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" width="72" height="72" aria-hidden="true">
      <g fill="none" stroke="var(--ink-accent)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M3 3 C 36 5 60 11 80 26 C 89 33 95 42 97 55" />
        <path d="M3 3 C 5 36 11 60 26 80" />
      </g>
      <path d="M80 26 c 7 -8 5 -17 -2 -22 c -5 6 -3 15 2 22 z" fill="var(--ink-accent)" opacity="0.75" />
      <path d="M26 80 c -8 7 -17 5 -22 -2 c 6 -5 15 -3 22 2 z" fill="var(--ink-accent)" opacity="0.75" />
      <circle cx="97" cy="55" r="2.3" fill="var(--ink-accent)" />
      <circle cx="55" cy="97" r="2.3" fill="var(--ink-accent)" />
    </svg>
  );
}

/** Padrão damasco discreto (tom-sobre-tom na cor do tema) sobre o papel. */
function Damask() {
  return (
    <svg className="env-damask" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="lgm-damask" width="40" height="40" patternUnits="userSpaceOnUse">
          <g fill="var(--accent)" fillOpacity="0.1">
            <circle cx="20" cy="13" r="6" />
            <circle cx="27" cy="20" r="6" />
            <circle cx="20" cy="27" r="6" />
            <circle cx="13" cy="20" r="6" />
            <circle cx="20" cy="20" r="3" />
            <circle cx="0" cy="0" r="2.5" />
            <circle cx="40" cy="0" r="2.5" />
            <circle cx="0" cy="40" r="2.5" />
            <circle cx="40" cy="40" r="2.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lgm-damask)" />
    </svg>
  );
}

/** Ícone de toque (mãozinha) — única indicação com o envelope fechado. */
function TapIcon() {
  return (
    <svg
      className="gate-tap"
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="var(--ink-accent)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 9.5V4a2 2 0 0 1 4 0v6" />
      <path d="M14 10V8.5a2 2 0 0 1 4 0V13" />
      <path d="M18 11.5a2 2 0 0 1 4 0V15a7 7 0 0 1-7 7h-2c-2.8 0-4.3-.9-5.8-2.4l-3.6-3.6a2 2 0 0 1 2.9-2.8L10 15" />
    </svg>
  );
}

/**
 * Portão de entrada do site: um envelope de convite fechado (nas cores do tema)
 * com o monograma do casal como selo de cera. Ao clicar, a aba abre, um brilho
 * dourado floresce, o monograma e os nomes surgem e o overlay some, revelando o
 * site. Sem texto com o envelope fechado. Cores herdadas do wrapper temado do
 * SiteView; animação em CSS puro (ver globals.css).
 */
export function InvitationGate({
  coupleNames,
  dateLabel,
  locationLabel,
  mLeft,
  mRight,
}: {
  coupleNames: string;
  dateLabel: string | null;
  locationLabel: string | null;
  mLeft: string;
  mRight: string;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trava o scroll do site enquanto o convite não foi aberto.
  useEffect(() => {
    if (phase === "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Limpa o timer se o componente sair antes da animação terminar.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const open = useCallback(() => {
    if (phase !== "closed") return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setPhase("opening");
    // Aguarda a animação (ou um fade curto quando o usuário pede menos movimento).
    timer.current = setTimeout(() => setPhase("open"), reduce ? 500 : 2600);
  }, [phase]);

  if (phase === "open") return null;

  const dateLine = [dateLabel, locationLabel].filter(Boolean).join(" · ");

  return (
    <div
      id="invitation-gate"
      className="gate-overlay fixed inset-0 z-[60] flex items-center justify-center px-6"
      data-phase={phase}
      style={{ background: "linear-gradient(180deg, var(--ink), var(--ink-soft))" }}
    >
      {/* Sem JavaScript o botão não abriria: esconde o portão e mostra o site. */}
      <noscript>
        <style>{`#invitation-gate{display:none!important}`}</style>
      </noscript>

      <div className="gate-sparkles" data-phase={phase} aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="gate-spark"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>

      <div className="gate-frame" aria-hidden="true">
        <CornerFlourish className="gate-corner gate-corner--tl" />
        <CornerFlourish className="gate-corner gate-corner--tr" />
        <CornerFlourish className="gate-corner gate-corner--bl" />
        <CornerFlourish className="gate-corner gate-corner--br" />
      </div>

      <div className="env-scene">
        {/* Conteúdo que surge ao abrir (brilho + monograma + nomes). */}
        <div className="env-reveal" data-phase={phase} aria-hidden={phase === "closed"}>
          <span className="env-glow" aria-hidden="true" />
          <Crest left={mLeft} right={mRight} size={96} />
          <span className="env-reveal-names">{coupleNames}</span>
          {dateLine && <span className="env-reveal-date">{dateLine}</span>}
        </div>

        <button
          type="button"
          onClick={open}
          aria-label="Abrir convite"
          className="envelope"
          data-phase={phase}
        >
          {/* Frente do envelope: papel + textura damasco + costuras douradas */}
          <span className="env-face" aria-hidden="true">
            <Damask />
            <svg className="env-seams" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M3 97 L50 54 L97 97"
                fill="none"
                stroke="var(--ink-accent)"
                strokeWidth="1"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M2 4 L50 54 M98 4 L50 54"
                fill="none"
                stroke="var(--ink-accent)"
                strokeWidth="1"
                strokeOpacity="0.28"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>

          {/* Aba superior (abre ao clicar) com fio dourado */}
          <span className="env-flap" data-phase={phase} aria-hidden="true">
            <svg className="env-flap-edge" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="1,1 99,1 50,98"
                fill="none"
                stroke="var(--ink-accent)"
                strokeWidth="1.2"
                strokeOpacity="0.7"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>

          {/* Selo de cera com o monograma do casal */}
          <span className="env-seal" data-phase={phase} aria-hidden="true">
            <Crest left={mLeft} right={mRight} size={46} />
          </span>
        </button>

        <p className="gate-hint" data-phase={phase}>
          <TapIcon />
        </p>
      </div>
    </div>
  );
}
