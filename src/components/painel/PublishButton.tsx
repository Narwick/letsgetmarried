"use client";

import { useState } from "react";

export function PublishButton({ weddingId }: { weddingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId, couponCode: coupon.trim() || undefined }),
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
      <div className="mb-3 max-w-xs">
        <label htmlFor="coupon" className="mb-1 block text-sm text-muted">
          Cupom de desconto (opcional)
        </label>
        <input
          id="coupon"
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          placeholder="Ex.: AMIGO10"
          autoCapitalize="characters"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase outline-none focus:border-accent"
        />
      </div>
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
