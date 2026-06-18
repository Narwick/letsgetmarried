import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckout } from "@/lib/abacatepay";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const PRODUCT_ID = process.env.ABACATEPAY_PRODUCT_ID;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  if (!PRODUCT_ID) {
    return NextResponse.json({ error: "ABACATEPAY_PRODUCT_ID não configurado." }, { status: 500 });
  }

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
    const checkout = await createCheckout({
      productId: PRODUCT_ID,
      externalId: wedding.id,
      returnUrl: `${SITE_URL}/painel`,
      completionUrl: `${SITE_URL}/painel?pago=1`,
    });

    // Registra a cobrança pendente (idempotência do webhook usa esse id).
    const admin = createAdminClient();
    await admin.from("payments").insert({
      wedding_id: wedding.id,
      abacatepay_billing_id: checkout.id,
      amount: checkout.amount,
      status: "pending",
    });

    return NextResponse.json({ url: checkout.url, billingId: checkout.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar cobrança.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
