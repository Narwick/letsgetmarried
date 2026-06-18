import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractCheckoutId, extractExternalId } from "@/lib/abacatepay";

type Admin = ReturnType<typeof createAdminClient>;

/** Publica o site por 1 ano. */
async function publishWedding(admin: Admin, weddingId: string) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  await admin
    .from("weddings")
    .update({
      status: "published",
      published_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", weddingId);
}

/**
 * Webhook da AbacatePay (v2). Configure no painel a URL:
 *   https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=SEU_SEGREDO
 * Evento: checkout.completed → publica o site por 1 ano.
 */
export async function POST(request: NextRequest) {
  // 1) Valida o segredo (enviado como query param pela AbacatePay).
  const secret = request.nextUrl.searchParams.get("webhookSecret");
  if (!secret || secret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const event = payload?.event as string | undefined;

  const paidEvents = ["checkout.completed", "billing.paid", "transparent.completed"];
  if (!event || !paidEvents.includes(event)) {
    return NextResponse.json({ ignored: true });
  }

  const checkoutId = extractCheckoutId(payload);
  const externalId = extractExternalId(payload);
  const admin = createAdminClient();

  // 2) Caminho principal: localiza o pagamento pelo id do checkout (idempotente).
  if (checkoutId) {
    const { data: payment } = await admin
      .from("payments")
      .select("id, wedding_id, status")
      .eq("abacatepay_billing_id", checkoutId)
      .maybeSingle();

    if (payment) {
      if (payment.status === "paid") return NextResponse.json({ ok: true, alreadyProcessed: true });
      await admin
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payment.id);
      await publishWedding(admin, payment.wedding_id);
      return NextResponse.json({ ok: true });
    }
  }

  // 3) Fallback: usa o externalId (id do wedding) enviado na criação do checkout.
  if (externalId) {
    const { data: wedding } = await admin
      .from("weddings")
      .select("id")
      .eq("id", externalId)
      .maybeSingle();
    if (wedding) {
      await publishWedding(admin, wedding.id);
      if (checkoutId) {
        await admin.from("payments").upsert(
          {
            wedding_id: wedding.id,
            abacatepay_billing_id: checkoutId,
            amount: 0,
            status: "paid",
            paid_at: new Date().toISOString(),
          },
          { onConflict: "abacatepay_billing_id" },
        );
      }
      return NextResponse.json({ ok: true, viaExternalId: true });
    }
  }

  return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
}
