import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBilling } from "@/lib/abacatepay";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const PRICE_CENTS = parseInt(process.env.SUBSCRIPTION_PRICE_CENTS || "9900", 10);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { weddingId } = await request.json();

  // Confirma que o wedding é do usuário (RLS já protege, mas validamos).
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, slug")
    .eq("id", weddingId)
    .eq("owner_id", user.id)
    .single();

  if (!wedding) return NextResponse.json({ error: "Site não encontrado." }, { status: 404 });

  try {
    const billing = await createBilling({
      amountCents: PRICE_CENTS,
      externalId: wedding.id,
      productName: "Assinatura anual — site de casamento",
      returnUrl: `${SITE_URL}/painel`,
      completionUrl: `${SITE_URL}/painel?pago=1`,
      customerEmail: user.email ?? undefined,
    });

    // Registra a cobrança pendente (idempotência do webhook usa esse id).
    const admin = createAdminClient();
    await admin.from("payments").insert({
      wedding_id: wedding.id,
      abacatepay_billing_id: billing.id,
      amount: PRICE_CENTS,
      status: "pending",
    });

    return NextResponse.json({ url: billing.url, billingId: billing.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar cobrança.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
