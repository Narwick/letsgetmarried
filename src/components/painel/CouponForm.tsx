"use client";

import { useActionState } from "react";
import { createCoupon } from "@/app/painel/admin/actions";

type State = { ok?: boolean; error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  return await createCoupon(formData);
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent";

export function CouponForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-surface p-5"
    >
      <h2 className="font-serif text-xl text-foreground">Novo cupom</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Código</label>
          <input
            name="code"
            required
            placeholder="AMIGO_10"
            className={`${inputCls} uppercase placeholder:normal-case`}
          />
          <p className="mt-1 text-xs text-muted">Maiúsculas, números e _ (ex.: AMIGO_10).</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Dono do cupom</label>
          <input name="owner_name" required placeholder="Maria Afiliada" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Contato p/ pagar comissão (PIX / e-mail)
        </label>
        <input name="owner_contact" placeholder="pix@maria.com" className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground">Desconto (%)</label>
          <input name="discount_percent" type="number" min={1} max={100} defaultValue={10} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Comissão (%)</label>
          <input name="commission_percent" type="number" min={0} max={100} defaultValue={20} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Máx. usos</label>
          <input name="max_redeems" type="number" min={-1} defaultValue={-1} className={inputCls} />
          <p className="mt-1 text-xs text-muted">-1 = ilimitado.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Notas (opcional)</label>
        <input name="notes" className={inputCls} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Criando..." : "Criar cupom"}
        </button>
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        {state?.ok && <span className="text-sm text-green-700">Cupom criado!</span>}
      </div>
    </form>
  );
}
