"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { claimGift } from "@/app/[slug]/actions";
import { PixCard } from "@/components/site/PixCard";

/**
 * Área de ação do card de presente: mostra o QR Code PIX e, para itens que não
 * são do fundo de lua de mel, um botão "Já presenteei" que marca o item como
 * indisponível. Quando confirmado, o card passa a exibir o estado de escolhido.
 */
export function GiftActions({
  giftId,
  slug,
  payload,
  isHoneymoon,
  initialClaimed,
}: {
  giftId: string;
  slug: string;
  payload: string | null;
  isHoneymoon: boolean;
  initialClaimed: boolean;
}) {
  const router = useRouter();
  const [claimed, setClaimed] = useState(initialClaimed);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (claimed) {
    return (
      <div
        className="rounded-lg border border-dashed px-4 py-5 text-center text-sm"
        style={{ borderColor: "var(--ink-soft)", color: "var(--on-ink-soft)" }}
      >
        🎁 Presente já escolhido — obrigado!
      </div>
    );
  }

  async function confirm() {
    setLoading(true);
    setError(null);
    const res = await claimGift({ giftId, slug });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      setConfirming(false);
      return;
    }
    setClaimed(true);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {payload && (
        <div className="rounded-lg bg-white p-4">
          <PixCard payload={payload} size={160} />
        </div>
      )}

      {!isHoneymoon &&
        (confirming ? (
          <div className="space-y-2 text-center">
            <p className="text-xs text-[var(--on-ink-soft)]">
              Confirmar que você já presenteou? O item ficará indisponível para os demais.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={confirm}
                disabled={loading}
                className="rounded-full bg-[var(--ink-accent)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition disabled:opacity-50"
              >
                {loading ? "Confirmando..." : "Sim, confirmar"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="rounded-full border px-3 py-1.5 text-xs"
                style={{ borderColor: "var(--ink-soft)", color: "var(--on-ink-soft)" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="block w-full text-center text-xs underline transition hover:text-[var(--ink-accent)]"
            style={{ color: "var(--on-ink-soft)" }}
          >
            Já presenteei este item
          </button>
        ))}

      {error && <p className="text-center text-xs text-red-300">{error}</p>}
    </div>
  );
}
