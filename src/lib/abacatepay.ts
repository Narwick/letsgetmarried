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
    }),
  });

  const json = await res.json();
  if (!res.ok || json.success === false || json.error) {
    throw new Error(typeof json.error === "string" ? json.error : `AbacatePay HTTP ${res.status}`);
  }

  const data = json.data;
  return { id: data.id, url: data.url, amount: data.amount };
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
