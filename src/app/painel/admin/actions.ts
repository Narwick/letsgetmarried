"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { createCoupon as createAbacateCoupon } from "@/lib/abacatepay";

function num(form: FormData, key: string): number | null {
  const v = form.get(key);
  if (typeof v !== "string" || !v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

/** Cria um cupom: grava no banco e espelha na AbacatePay (desconto real). */
export async function createCoupon(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();

  const code = (str(formData, "code") || "").toUpperCase();
  const ownerName = str(formData, "owner_name");
  const discount = num(formData, "discount_percent") ?? 10;
  const commission = num(formData, "commission_percent") ?? 0;
  const maxRedeems = num(formData, "max_redeems") ?? -1;

  if (!/^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(code)) {
    return { error: "Código inválido. Use letras maiúsculas, números e _ (ex.: AMIGO_10)." };
  }
  if (!ownerName) return { error: "Informe o nome do dono do cupom." };
  if (discount < 1 || discount > 100) return { error: "Desconto deve ser entre 1 e 100%." };
  if (commission < 0 || commission > 100) return { error: "Comissão deve ser entre 0 e 100%." };

  const admin = createAdminClient();

  // 1) Espelha na AbacatePay primeiro — é o que faz o desconto valer no checkout.
  try {
    await createAbacateCoupon({
      code,
      discountPercent: discount,
      maxRedeems,
      notes: `Afiliado: ${ownerName}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar cupom na AbacatePay.";
    return { error: `AbacatePay: ${msg}` };
  }

  // 2) Grava no nosso banco (fonte da verdade do dono e da comissão).
  const { error } = await admin.from("coupons").insert({
    code,
    owner_name: ownerName,
    owner_contact: str(formData, "owner_contact"),
    discount_percent: discount,
    commission_percent: commission,
    max_redeems: maxRedeems,
    notes: str(formData, "notes"),
  });

  if (error) {
    if (error.code === "23505") return { error: "Já existe um cupom com esse código." };
    return { error: error.message };
  }

  revalidatePath("/painel/admin");
  return { ok: true };
}

/** Ativa/desativa um cupom (não passa mais o código no checkout quando inativo). */
export async function toggleCoupon(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  const admin = createAdminClient();
  await admin.from("coupons").update({ active: !active }).eq("id", id);
  revalidatePath("/painel/admin");
}

/** Marca a comissão de um pagamento como paga (admin pagou o dono por fora). */
export async function markCommissionPaid(formData: FormData): Promise<void> {
  await requireAdmin();
  const paymentId = formData.get("payment_id") as string;

  const admin = createAdminClient();
  await admin
    .from("payments")
    .update({ commission_status: "paid", commission_paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .eq("commission_status", "pending");
  revalidatePath("/painel/admin");
}
