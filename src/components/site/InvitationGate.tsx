"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crest } from "@/components/site/Crest";

type Phase = "closed" | "opening" | "open";

/**
 * Portão de entrada do site: um envelope de convite fechado (nas cores do tema)
 * com o monograma do casal como selo. Ao clicar, a aba abre, o cartão sobe e o
 * overlay some, revelando o site por baixo. Cores herdadas do wrapper temado do
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
    timer.current = setTimeout(() => setPhase("open"), reduce ? 400 : 1700);
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

      <div className="env-scene">
        <button
          type="button"
          onClick={open}
          aria-label="Abrir convite"
          className="envelope"
          data-phase={phase}
        >
          {/* Carta que sobe de dentro do envelope ao abrir */}
          <span className="env-letter" data-phase={phase} aria-hidden="true">
            <span className="env-letter-kicker">Com alegria, convidamos você</span>
            <span className="env-letter-names">{coupleNames}</span>
            {dateLine && <span className="env-letter-date">{dateLine}</span>}
          </span>

          {/* Frente do envelope */}
          <span className="env-face">
            <span className="env-face-names">{coupleNames}</span>
            {dateLine && <span className="env-face-date">{dateLine}</span>}
            <span className="env-cta">Abrir convite</span>
          </span>

          {/* Aba superior (abre ao clicar) */}
          <span className="env-flap" data-phase={phase} aria-hidden="true" />

          {/* Selo de cera com o monograma do casal */}
          <span className="env-seal" data-phase={phase} aria-hidden="true">
            <Crest left={mLeft} right={mRight} size={46} />
          </span>
        </button>

        <p className="gate-hint" data-phase={phase}>
          Toque para abrir
        </p>
      </div>
    </div>
  );
}
