"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveCoverPhoto, saveCoverPosition } from "@/app/painel/actions";

const BUCKET = "wedding-photos";

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

function parsePos(p: string | null): { x: number; y: number } {
  const m = (p ?? "").match(/^(\d{1,3})% (\d{1,3})%$/);
  if (m) return { x: clamp(+m[1]), y: clamp(+m[2]) };
  return { x: 50, y: 50 };
}

const PRESETS: { label: string; value: string }[] = [
  { label: "Topo", value: "50% 0%" },
  { label: "Centro", value: "50% 50%" },
  { label: "Base", value: "50% 100%" },
];

export function CoverPhotoUpload({
  weddingId,
  initialUrl,
  initialPosition,
}: {
  weddingId: string;
  initialUrl: string | null;
  initialPosition: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [position, setPosition] = useState<string>(initialPosition || "center");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posSaved, setPosSaved] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/cover-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const res = await saveCoverPhoto(weddingId, publicUrl);
    setUploading(false);
    if (res?.error) setError(res.error);
    else setUrl(publicUrl);
  }

  async function handleRemove() {
    setUploading(true);
    await saveCoverPhoto(weddingId, null);
    setUrl(null);
    setUploading(false);
  }

  async function persistPosition(p: string) {
    setPosSaved(false);
    await saveCoverPosition(weddingId, p);
    setPosSaved(true);
    setTimeout(() => setPosSaved(false), 1500);
  }

  /** Atualiza a posição a partir das coordenadas do ponteiro e devolve o valor. */
  function moveTo(clientX: number, clientY: number): string {
    const el = boxRef.current;
    if (!el) return position;
    const r = el.getBoundingClientRect();
    const x = clamp(((clientX - r.left) / r.width) * 100);
    const y = clamp(((clientY - r.top) / r.height) * 100);
    const p = `${x}% ${y}%`;
    setPosition(p);
    return p;
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    boxRef.current?.setPointerCapture(e.pointerId);
    moveTo(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    moveTo(e.clientX, e.clientY);
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    boxRef.current?.releasePointerCapture(e.pointerId);
    persistPosition(moveTo(e.clientX, e.clientY));
  }

  function choosePreset(value: string) {
    setPosition(value);
    persistPosition(value);
  }

  const marker = parsePos(position);

  return (
    <div className="space-y-3">
      {url ? (
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative h-48 w-full cursor-grab touch-none select-none overflow-hidden rounded-xl border border-stone-200 active:cursor-grabbing"
          title="Arraste para escolher o ponto de foco da imagem"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Foto de capa"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
            style={{ objectPosition: position }}
          />
          {/* Marcador do ponto de foco */}
          <span
            className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,.35)]"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-sm text-stone-400">
          Nenhuma foto de capa
        </div>
      )}

      {url && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500">Ponto de foco:</span>
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => choosePreset(p.value)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                position === p.value
                  ? "border-accent bg-accent-soft text-accent-hover"
                  : "border-stone-300 text-stone-600 hover:border-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
          {posSaved && <span className="text-xs text-green-700">Posição salva!</span>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
          {uploading ? "Enviando..." : url ? "Trocar foto" : "Enviar foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="text-sm text-red-600 hover:underline"
          >
            Remover
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-stone-500">
        Recomendado: imagem horizontal, até 5 MB. Arraste sobre a imagem para escolher o
        enquadramento que aparece no site.
      </p>
    </div>
  );
}
