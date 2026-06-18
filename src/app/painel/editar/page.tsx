import { getOrCreateWedding } from "../actions";
import { EditForm } from "@/components/painel/EditForm";
import { CoverPhotoUpload } from "@/components/painel/CoverPhotoUpload";
import type { Wedding } from "@/lib/types";

export default async function EditarPage() {
  const wedding = (await getOrCreateWedding()) as Wedding;
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-stone-800">Editar site</h1>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-medium text-stone-800">Foto de capa</h2>
        <CoverPhotoUpload weddingId={wedding.id} initialUrl={wedding.cover_photo_url} />
      </section>

      <EditForm wedding={wedding} />
    </div>
  );
}
