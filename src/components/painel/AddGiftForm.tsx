"use client";

import { useActionState, useRef } from "react";
import { addGift } from "@/app/painel/actions";

type State = { ok?: boolean; error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  return await addGift(formData);
}

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900";

export function AddGiftForm({ weddingId }: { weddingId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (fd) => {
        await formAction(fd);
        ref.current?.reset();
      }}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
    >
      <input type="hidden" name="wedding_id" value={weddingId} />
      <h2 className="font-medium">Adicionar presente</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input name="title" required className={inputCls} placeholder="Jogo de panelas" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor sugerido (R$)</label>
          <input name="suggested_amount" type="number" step="0.01" min="0" className={inputCls} placeholder="deixe em branco p/ valor livre" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <input name="description" className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="is_honeymoon_fund" className="h-4 w-4" />
        É um item do fundo da lua de mel (doação de viagem)
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Adicionando..." : "Adicionar"}
        </button>
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
