"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRsvp } from "@/app/[slug]/actions";

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-foreground outline-none focus:border-accent";

export function RsvpForm({ weddingId, slug }: { weddingId: string; slug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companions, setCompanions] = useState(0);
  const [attending, setAttending] = useState(true);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const res = await submitRsvp({
      weddingId,
      slug,
      name,
      attending,
      companions: attending ? companions : 0,
      message,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSent(true);
    setName("");
    setMessage("");
    setCompanions(0);
    setAttending(true);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-accent text-accent">
          ✓
        </div>
        <h3 className="font-serif text-2xl text-foreground">Presença registrada!</h3>
        <p className="text-muted">Obrigado por confirmar. Mal podemos esperar para celebrar com você.</p>
        <button
          onClick={() => setSent(false)}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
        >
          Enviar outra confirmação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-muted">
        Seu nome
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Nome completo" required />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-muted">
          Acompanhantes
          <input
            type="number"
            min={0}
            max={20}
            value={companions}
            onChange={(e) => setCompanions(parseInt(e.target.value || "0", 10))}
            className={inputCls}
            disabled={!attending}
          />
        </label>
        <div className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-muted">
          Você vai?
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm normal-case ${
                attending ? "border-accent bg-accent text-white" : "border-border text-foreground"
              }`}
            >
              Sim, vou!
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm normal-case ${
                !attending ? "border-accent bg-accent text-white" : "border-border text-foreground"
              }`}
            >
              Não poderei
            </button>
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-muted">
        Mensagem (opcional)
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} placeholder="Um voto, uma lembrança, um carinho…" />
      </label>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded-full bg-accent px-5 py-3 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Confirmar presença"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
