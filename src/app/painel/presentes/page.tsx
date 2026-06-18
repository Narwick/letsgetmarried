import { getOrCreateWedding, deleteGift } from "../actions";
import { AddGiftForm } from "@/components/painel/AddGiftForm";
import { createClient } from "@/lib/supabase/server";
import type { Gift, Wedding } from "@/lib/types";

function brl(cents: number | null): string {
  if (cents == null) return "Valor livre";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PresentesPage() {
  const wedding = (await getOrCreateWedding()) as Wedding;
  const supabase = await createClient();
  const { data } = await supabase
    .from("gifts")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true });
  const gifts = (data ?? []) as Gift[];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-foreground">Lista de presentes</h1>

      <AddGiftForm weddingId={wedding.id} />

      <section className="space-y-3">
        {gifts.length === 0 && (
          <p className="text-sm text-muted">Nenhum presente cadastrado ainda.</p>
        )}
        {gifts.map((g) => (
          <div
            key={g.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
          >
            <div>
              <p className="font-medium text-foreground">
                {g.title}
                {g.is_honeymoon_fund && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-hover">
                    Lua de mel
                  </span>
                )}
              </p>
              {g.description && <p className="text-sm text-muted">{g.description}</p>}
              <p className="text-sm text-muted">{brl(g.suggested_amount)}</p>
            </div>
            <form action={deleteGift}>
              <input type="hidden" name="id" value={g.id} />
              <button className="text-sm text-red-600 hover:underline">Remover</button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
