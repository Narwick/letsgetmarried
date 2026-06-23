import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o code do link mágico por uma sessão e redireciona ao painel.
 *
 * Atrás do proxy do Coolify (Traefik), o `origin` de `request.url` resolve para
 * o bind interno do container (0.0.0.0:3000), gerando links quebrados no e-mail.
 * Por isso montamos o destino a partir da URL pública configurada, com fallback
 * nos cabeçalhos encaminhados pelo proxy.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Só aceitamos caminhos internos para evitar open redirect.
  let redirect = searchParams.get("redirect") || "/painel";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) redirect = "/painel";

  const base = publicBaseUrl(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${redirect}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth`);
}

/** URL pública do site (sem barra final), resistente a proxy reverso. */
function publicBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}
