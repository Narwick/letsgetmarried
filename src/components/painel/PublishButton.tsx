"use client";

import { useState } from "react";

export function PublishButton({ weddingId }: { weddingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao iniciar pagamento.");
      // Redireciona para a página de pagamento PIX hospedada pela AbacatePay.
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Gerando pagamento..." : "Pagar e publicar (PIX)"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
