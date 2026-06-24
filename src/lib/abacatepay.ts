/**
 * Wrapper da API da AbacatePay (v2 checkouts) para cobrar a assinatura anual
 * via PIX. Só roda no servidor — usa a API key do .env.
 * A v2 cobra por produto pré-cadastrado: passamos o id do produto da assinatura.
 * Docs: https://docs.abacatepay.com
 */

const BASE_URL = "https://api.abacatepay.com/v2";

interface CreateCheckoutParams {
  productId: string;
  externalId: string; // referência interna (id do wedding)
  returnUrl: string;
  completionUrl: string;
  coupons?: string[]; // códigos de cupom a aplicar no checkout
}

interface CheckoutResponse {
  id: string;
  url: string;
  amount: number;
}

function apiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) throw new Error("ABACATEPAY_API_KEY não configurada.");
  return key;
}

/** Cria um checkout PIX (pagamento único) e retorna o link de pagamento. */
export async function createCheckout(p: CreateCheckoutParams): Promise<CheckoutResponse> {
  const res = await fetch(`${BASE_URL}/checkouts/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ id: p.productId, quantity: 1 }],
      methods: ["PIX"],
      returnUrl: p.returnUrl,
      completionUrl: p.completionUrl,
      externalId: p.externalId,
      ...(p.coupons?.length ? { coupons: p.coupons } : {}),
    }),
  });

  const json = await res.json();
  if (!res.ok || json.success === false || json.error) {
    throw new Error(typeof json.error === "string" ? json.error : `AbacatePay HTTP ${res.status}`);
  }

  const data = json.data;
  return { id: data.id, url: data.url, amount: data.amount };
}

interface CreateCouponParams {
  code: string;
  discountPercent: number; // 1–100
  maxRedeems?: number; // -1 = ilimitado (padrão)
  notes?: string;
}

/**
 * Cria um cupom de desconto percentual na AbacatePay (v2: POST /coupons/create).
 * É isso que faz o desconto valer no checkout (passamos o código em `coupons`).
 * Lança em caso de erro.
 */
export async function createCoupon(p: CreateCouponParams): Promise<{ code: string }> {
  const res = await fetch(`${BASE_URL}/coupons/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: p.code,
      // PERCENTAGE na AbacatePay é em centésimos de % (basis points): 9000 = 90%.
      discount: Math.round(p.discountPercent * 100),
      discountKind: "PERCENTAGE",
      maxRedeems: p.maxRedeems ?? -1,
      notes: p.notes ?? "",
    }),
  });

  const json = await res.json();
  if (!res.ok || json.success === false || json.error) {
    throw new Error(typeof json.error === "string" ? json.error : `AbacatePay HTTP ${res.status}`);
  }

  return { code: json.data?.code ?? p.code };
}

/** Extrai o id do checkout do payload do webhook, tolerando variações de formato. */
export function extractCheckoutId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: Record<string, unknown> }).data;
  if (!data) return null;
  const checkout = data.checkout as { id?: string } | undefined;
  const billing = data.billing as { id?: string } | undefined;
  return (
    checkout?.id ??
    billing?.id ??
    (data.id as string | undefined) ??
    ((data.payment as { id?: string } | undefined)?.id as string | undefined) ??
    null
  );
}

/** Extrai o externalId (id do wedding) do payload do webhook. */
export function extractExternalId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: Record<string, unknown> }).data;
  if (!data) return null;
  const checkout = data.checkout as { externalId?: string } | undefined;
  return checkout?.externalId ?? (data.externalId as string | undefined) ?? null;
}
