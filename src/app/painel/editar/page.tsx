import { getOrCreateWedding } from "../actions";
import { EditForm } from "@/components/painel/EditForm";
import type { Wedding } from "@/lib/types";

export default async function EditarPage() {
  const wedding = (await getOrCreateWedding()) as Wedding;
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Editar site</h1>
      <EditForm wedding={wedding} />
    </div>
  );
}
