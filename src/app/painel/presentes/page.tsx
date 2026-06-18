import { getOrCreateWedding } from "../actions";
import { AddGiftForm } from "@/components/painel/AddGiftForm";
import { GiftRow } from "@/components/painel/GiftRow";
import { createClient } from "@/lib/supabase/server";
import type { Gift, Wedding } from "@/lib/types";

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
          <GiftRow key={g.id} gift={g} weddingId={wedding.id} />
        ))}
      </section>
    </div>
  );
}
