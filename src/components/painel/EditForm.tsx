"use client";

import { useActionState } from "react";
import { saveWedding } from "@/app/painel/actions";
import { maskTime } from "@/lib/masks";
import type { Wedding } from "@/lib/types";

/** Aplica a máscara de horário num input não-controlado (mantém o cursor utilizável). */
function onTimeInput(e: React.FormEvent<HTMLInputElement>) {
  e.currentTarget.value = maskTime(e.currentTarget.value);
}

type State = { ok?: boolean; error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  return await saveWedding(formData);
}

const labelCls = "block text-sm font-medium text-foreground";
const inputCls =
  "mt-1 w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-accent";

function dateForInput(iso: string | null): string {
  if (!iso) return "";
  // datetime-local espera "YYYY-MM-DDTHH:mm"
  return new Date(iso).toISOString().slice(0, 16);
}

export function EditForm({ wedding }: { wedding: Wedding }) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={wedding.id} />

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-serif text-xl text-foreground">O casal</h2>
        <div>
          <label className={labelCls}>Nome do casal</label>
          <input name="couple_names" defaultValue={wedding.couple_names ?? ""} className={inputCls} placeholder="João & Maria" />
        </div>
        <div>
          <label className={labelCls}>Endereço do site (slug)</label>
          <input name="slug" defaultValue={wedding.slug} className={inputCls} placeholder="joao-e-maria" />
          <p className="mt-1 text-xs text-muted">Só letras minúsculas, números e hífens. Ex.: joao-e-maria</p>
        </div>
        <div>
          <label className={labelCls}>Nossa história</label>
          <textarea name="story" defaultValue={wedding.story ?? ""} rows={5} className={inputCls} placeholder="Como tudo começou..." />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-serif text-xl text-foreground">Save the date</h2>
        <div>
          <label className={labelCls}>Data e hora</label>
          <input type="datetime-local" name="event_date" defaultValue={dateForInput(wedding.event_date)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Local</label>
          <input name="event_location" defaultValue={wedding.event_location ?? ""} className={inputCls} placeholder="Espaço Jardim, São Paulo" />
        </div>
        <div>
          <label className={labelCls}>Outras informações</label>
          <textarea name="event_details" defaultValue={wedding.event_details ?? ""} rows={3} className={inputCls} placeholder="Traje, estacionamento, recepção..." />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-serif text-xl text-foreground">Cerimônia</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Local</label>
            <input name="ceremony_local" defaultValue={wedding.ceremony?.local ?? ""} className={inputCls} placeholder="Igreja Nossa Senhora" />
          </div>
          <div>
            <label className={labelCls}>Horário</label>
            <input name="ceremony_horario" defaultValue={wedding.ceremony?.horario ?? ""} onInput={onTimeInput} inputMode="numeric" className={inputCls} placeholder="16h00" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Endereço</label>
            <input name="ceremony_endereco" defaultValue={wedding.ceremony?.endereco ?? ""} className={inputCls} placeholder="Rua das Flores, 100 — São Paulo/SP" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Link do Google Maps (opcional)</label>
            <input name="ceremony_maps" defaultValue={wedding.ceremony?.maps ?? ""} className={inputCls} placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" name="show_reception" defaultChecked={wedding.show_reception} className="h-4 w-4 accent-accent" />
          Temos recepção em local separado
        </label>
        <p className="text-sm text-muted">Marque se a festa/recepção é em outro endereço. Se desmarcado, esta seção não aparece no site.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Local da recepção</label>
            <input name="reception_local" defaultValue={wedding.reception?.local ?? ""} className={inputCls} placeholder="Espaço Villa Real" />
          </div>
          <div>
            <label className={labelCls}>Horário</label>
            <input name="reception_horario" defaultValue={wedding.reception?.horario ?? ""} onInput={onTimeInput} inputMode="numeric" className={inputCls} placeholder="18h00" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Endereço</label>
            <input name="reception_endereco" defaultValue={wedding.reception?.endereco ?? ""} className={inputCls} placeholder="Av. dos Jardins, 2500 — São Paulo/SP" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Link do Google Maps (opcional)</label>
            <input name="reception_maps" defaultValue={wedding.reception?.maps ?? ""} className={inputCls} placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-serif text-xl text-foreground">Detalhes & encerramento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Inicial do noivo(a) 1</label>
            <input name="monogram_left" maxLength={2} defaultValue={wedding.monogram_left ?? ""} className={inputCls} placeholder="J" />
          </div>
          <div>
            <label className={labelCls}>Inicial do noivo(a) 2</label>
            <input name="monogram_right" maxLength={2} defaultValue={wedding.monogram_right ?? ""} className={inputCls} placeholder="M" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Traje / dress code (opcional)</label>
          <input name="dress_code" defaultValue={wedding.dress_code ?? ""} className={inputCls} placeholder="Traje Passeio Completo · tons sóbrios" />
        </div>
        <div>
          <label className={labelCls}>Mensagem / versículo de encerramento (opcional)</label>
          <textarea name="verse" defaultValue={wedding.verse ?? ""} rows={2} className={inputCls} placeholder="O amor tudo desculpa, tudo crê, tudo espera, tudo suporta." />
        </div>
        <div>
          <label className={labelCls}>Autor / referência (opcional)</label>
          <input name="verse_ref" defaultValue={wedding.verse_ref ?? ""} className={inputCls} placeholder="1 Coríntios 13, 7" />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="show_schedule" defaultChecked={wedding.show_schedule} className="h-4 w-4 accent-accent" />
          Exibir a programação do dia no site
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-serif text-xl text-foreground">Dados PIX (recebimento dos presentes)</h2>
        <p className="text-sm text-muted">
          Os convidados pagam direto na sua conta. Mostramos a chave e o QR Code no site.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Tipo de chave</label>
            <select name="pix_key_type" defaultValue={wedding.pix_key_type ?? ""} className={inputCls}>
              <option value="">Selecione</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave aleatória</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Chave PIX</label>
            <input name="pix_key" defaultValue={wedding.pix_key ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nome do recebedor</label>
            <input name="pix_recipient_name" defaultValue={wedding.pix_recipient_name ?? ""} className={inputCls} placeholder="Como aparece na conta" />
          </div>
          <div>
            <label className={labelCls}>Cidade</label>
            <input name="pix_city" defaultValue={wedding.pix_city ?? ""} className={inputCls} placeholder="SAO PAULO" />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
        {state?.ok && <span className="text-sm text-green-700">Salvo!</span>}
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
