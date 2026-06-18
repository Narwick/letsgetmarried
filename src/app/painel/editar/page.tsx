import { getOrCreateWedding } from "../actions";
import { EditForm } from "@/components/painel/EditForm";
import { CoverPhotoUpload } from "@/components/painel/CoverPhotoUpload";
import { ThemePicker } from "@/components/painel/ThemePicker";
import { DEFAULT_THEME } from "@/lib/themes";
import type { Wedding } from "@/lib/types";

export default async function EditarPage() {
  const wedding = (await getOrCreateWedding()) as Wedding;
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-foreground">Editar site</h1>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <div>
          <h2 className="font-serif text-xl text-foreground">Paleta do site</h2>
          <p className="text-sm text-muted">
            Escolha as cores que combinam com o seu casamento. Salva automaticamente.
          </p>
        </div>
        <ThemePicker
          weddingId={wedding.id}
          initialTheme={wedding.theme || DEFAULT_THEME}
          initialCustomAccent={wedding.custom_accent}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-serif text-xl text-foreground">Foto de capa</h2>
        <CoverPhotoUpload weddingId={wedding.id} initialUrl={wedding.cover_photo_url} />
      </section>

      <EditForm wedding={wedding} />
    </div>
  );
}
