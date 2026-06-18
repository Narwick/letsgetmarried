/**
 * Wrapper mínimo da API da AbacatePay (v1 billing) para cobrar a assinatura
 * anual via PIX. Só roda no servidor — usa a API key do .env.
 * Docs: https://docs.abacatepay.com
 */

const BASE_URL = "https://api.abacatepay.com/v1";

interface CreateBillingParams {
  amountCents: number;
  externalId: string; // referência interna (id do wedding)
  productName: string;
  returnUrl: string;
  completionUrl: string;
  customerEmail?: string;
  customerName?: string;
}

interface BillingResponse {
  id: string;
  url: string;
  status: string;
}

function apiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) throw new Error("ABACATEPAY_API_KEY não configurada.");
  return key;
}

/** Cria uma cobrança PIX (pagamento único) e retorna o link de pagamento. */
export async function createBilling(p: CreateBillingParams): Promise<BillingResponse> {
  const body: Record<string, unknown> = {
    frequency: "ONE_TIME",
    methods: ["PIX"],
    products: [
      {
        externalId: p.externalId,
        name: p.productName,
        quantity: 1,
        price: p.amountCents,
      },
    ],
    returnUrl: p.returnUrl,
    completionUrl: p.completionUrl,
  };

  if (p.customerEmail) {
    body.customer = { email: p.customerEmail, name: p.customerName ?? p.customerEmail };
  }

  const res = await fetch(`${BASE_URL}/billing/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      typeof json.error === "string" ? json.error : `AbacatePay HTTP ${res.status}`,
    );
  }

  const data = json.data;
  return { id: data.id, url: data.url, status: data.status };
}

/**
 * Extrai o id da cobrança do payload do webhook, tolerando variações de formato
 * entre versões (billing.paid / checkout.completed).
 */
export function extractBillingId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: Record<string, unknown> }).data;
  if (!data) return null;
  const billing = data.billing as { id?: string } | undefined;
  const candidate =
    billing?.id ??
    (data.id as string | undefined) ??
    ((data.payment as { id?: string } | undefined)?.id as string | undefined);
  return candidate ?? null;
}
