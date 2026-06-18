"use client";

import { useActionState } from "react";
import { saveWedding } from "@/app/painel/actions";
import type { Wedding } from "@/lib/types";

type State = { ok?: boolean; error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  return await saveWedding(formData);
}

const labelCls = "block text-sm font-medium text-gray-700";
const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900";

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

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-medium">O casal</h2>
        <div>
          <label className={labelCls}>Nome do casal</label>
          <input name="couple_names" defaultValue={wedding.couple_names ?? ""} className={inputCls} placeholder="João & Maria" />
        </div>
        <div>
          <label className={labelCls}>Endereço do site (slug)</label>
          <input name="slug" defaultValue={wedding.slug} className={inputCls} placeholder="joao-e-maria" />
          <p className="mt-1 text-xs text-gray-500">Só letras minúsculas, números e hífens. Ex.: joao-e-maria</p>
        </div>
        <div>
          <label className={labelCls}>Nossa história</label>
          <textarea name="story" defaultValue={wedding.story ?? ""} rows={5} className={inputCls} placeholder="Como tudo começou..." />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-medium">Save the date</h2>
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

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-medium">Dados PIX (recebimento dos presentes)</h2>
        <p className="text-sm text-gray-500">
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
          className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
        {state?.ok && <span className="text-sm text-green-700">Salvo!</span>}
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
