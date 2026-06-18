import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractBillingId } from "@/lib/abacatepay";

/**
 * Webhook da AbacatePay. Configure no painel a URL:
 *   https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=SEU_SEGREDO
 * Ao confirmar o pagamento, publica o site por 1 ano.
 */
export async function POST(request: NextRequest) {
  // 1) Valida o segredo (enviado como query param pela AbacatePay).
  const secret = request.nextUrl.searchParams.get("webhookSecret");
  if (!secret || secret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const event = payload?.event as string | undefined;

  // 2) Só nos interessa pagamento confirmado.
  const paidEvents = ["billing.paid", "checkout.completed", "transparent.completed"];
  if (!event || !paidEvents.includes(event)) {
    return NextResponse.json({ ignored: true });
  }

  const billingId = extractBillingId(payload);
  if (!billingId) return NextResponse.json({ error: "billingId ausente" }, { status: 400 });

  const admin = createAdminClient();

  // 3) Idempotência: localiza o pagamento; se já estiver pago, não refaz nada.
  const { data: payment } = await admin
    .from("payments")
    .select("id, wedding_id, status")
    .eq("abacatepay_billing_id", billingId)
    .maybeSingle();

  if (!payment) return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  if (payment.status === "paid") return NextResponse.json({ ok: true, alreadyProcessed: true });

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // 4) Marca pago e publica o site por 1 ano.
  await admin
    .from("payments")
    .update({ status: "paid", paid_at: now.toISOString() })
    .eq("id", payment.id);

  await admin
    .from("weddings")
    .update({
      status: "published",
      published_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", payment.wedding_id);

  return NextResponse.json({ ok: true });
}
