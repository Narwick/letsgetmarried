import { getOrCreateWedding } from "../actions";
import { createClient } from "@/lib/supabase/server";
import type { Rsvp, Wedding } from "@/lib/types";

export default async function ConfirmacoesPage() {
  const wedding = (await getOrCreateWedding()) as Wedding;
  const supabase = await createClient();
  const { data } = await supabase
    .from("rsvps")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });
  const rsvps = (data ?? []) as Rsvp[];

  const indo = rsvps.filter((r) => r.attending);
  const naoVao = rsvps.filter((r) => !r.attending);
  const totalPessoas = indo.reduce((acc, r) => acc + 1 + (r.companions || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-foreground">Confirmações de presença</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Confirmaram", value: indo.length },
          { label: "Total de pessoas", value: totalPessoas },
          { label: "Não poderão ir", value: naoVao.length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="font-serif text-3xl text-foreground">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        {rsvps.length === 0 && (
          <p className="text-sm text-muted">Nenhuma confirmação ainda.</p>
        )}
        {rsvps.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{r.name}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  r.attending ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
                }`}
              >
                {r.attending ? "Vai" : "Não vai"}
              </span>
            </div>
            <p className="text-sm text-muted">
              {r.attending && r.companions > 0
                ? `+${r.companions} acompanhante(s)`
                : r.attending
                  ? "Sem acompanhantes"
                  : ""}
            </p>
            {r.message && <p className="mt-2 text-sm italic text-foreground">“{r.message}”</p>}
            <p className="mt-1 text-xs text-muted">
              {new Date(r.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
