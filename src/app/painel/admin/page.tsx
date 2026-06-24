import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { CouponForm } from "@/components/painel/CouponForm";
import { toggleCoupon, markCommissionPaid } from "./actions";
import type { Coupon } from "@/lib/types";

/** Formata centavos em BRL. */
function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type CommissionRow = {
  id: string;
  amount: number;
  commission_amount: number;
  commission_status: "pending" | "paid";
  commission_paid_at: string | null;
  coupon_id: string | null;
  coupon_code: string | null;
  created_at: string;
};

export default async function AdminPage() {
  const admin = createAdminClient();

  const [{ data: couponsData }, { data: commissionsData }] = await Promise.all([
    admin.from("coupons").select("*").order("created_at", { ascending: false }),
    admin
      .from("payments")
      .select(
        "id, amount, commission_amount, commission_status, commission_paid_at, coupon_id, coupon_code, created_at",
      )
      .not("commission_status", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const coupons = (couponsData ?? []) as Coupon[];
  const commissions = (commissionsData ?? []) as CommissionRow[];

  // Agregados por cupom (comissão pendente / paga).
  const byCoupon = new Map<string, { pending: number; paid: number }>();
  for (const c of commissions) {
    if (!c.coupon_id) continue;
    const agg = byCoupon.get(c.coupon_id) ?? { pending: 0, paid: 0 };
    if (c.commission_status === "paid") agg.paid += c.commission_amount;
    else agg.pending += c.commission_amount;
    byCoupon.set(c.coupon_id, agg);
  }

  const totalPending = commissions
    .filter((c) => c.commission_status === "pending")
    .reduce((s, c) => s + c.commission_amount, 0);
  const pending = commissions.filter((c) => c.commission_status === "pending");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Admin · Cupons</h1>
        <Link href="/painel" className="text-sm text-muted transition hover:text-accent">
          ← Voltar ao painel
        </Link>
      </div>

      <CouponForm />

      {/* ── Cupons ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-foreground">Cupons ({coupons.length})</h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-muted">Nenhum cupom ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Dono</th>
                  <th className="px-4 py-3 font-medium">Desc.</th>
                  <th className="px-4 py-3 font-medium">Comissão</th>
                  <th className="px-4 py-3 font-medium">Usos</th>
                  <th className="px-4 py-3 font-medium">Comissão acum.</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const agg = byCoupon.get(c.id) ?? { pending: 0, paid: 0 };
                  return (
                    <tr key={c.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-mono font-medium text-foreground">{c.code}</td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">{c.owner_name}</span>
                        {c.owner_contact && (
                          <span className="block text-xs text-muted">{c.owner_contact}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{c.discount_percent}%</td>
                      <td className="px-4 py-3">{c.commission_percent}%</td>
                      <td className="px-4 py-3">
                        {c.redeems_count}
                        {c.max_redeems !== -1 && <span className="text-muted">/{c.max_redeems}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-amber-700">{brl(agg.pending)}</span> pend.
                        <span className="block text-xs text-muted">{brl(agg.paid)} pagas</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {c.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={toggleCoupon}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="active" value={String(c.active)} />
                          <button className="text-xs text-muted transition hover:text-accent">
                            {c.active ? "Desativar" : "Ativar"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Comissões a pagar ────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-foreground">Comissões a pagar</h2>
          <p className="text-sm text-muted">
            Total pendente: <span className="font-medium text-amber-700">{brl(totalPending)}</span>
          </p>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma comissão pendente.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Cupom</th>
                  <th className="px-4 py-3 font-medium">Valor pago</th>
                  <th className="px-4 py-3 font-medium">Comissão</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-muted">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-mono">{c.coupon_code}</td>
                    <td className="px-4 py-3">{brl(c.amount)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{brl(c.commission_amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={markCommissionPaid}>
                        <input type="hidden" name="payment_id" value={c.id} />
                        <button className="rounded-full border border-border px-3 py-1 text-xs font-medium text-accent transition hover:border-accent">
                          Marcar como paga
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
