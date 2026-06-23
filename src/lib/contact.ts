/**
 * Dados de contato/suporte, configuráveis por variável de ambiente.
 * Em produção, defina no Coolify (NEXT_PUBLIC_* fica disponível no client):
 *   NEXT_PUBLIC_CONTACT_EMAIL=contato@seudominio.com
 *   NEXT_PUBLIC_CONTACT_WHATSAPP=5511912345678  (com DDI 55 + DDD)
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contato@letsgetmarried.com.br";

const RAW_WHATSAPP = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "5511999999999";

/** Só dígitos; prefixa o DDI 55 (Brasil) se vier sem código de país. */
export function whatsappDigits(): string {
  const d = RAW_WHATSAPP.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}

/** Número formatado para exibição: +55 (11) 91234-5678. */
export function whatsappDisplay(): string {
  const d = whatsappDigits();
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  const part = rest.length === 9 ? `${rest.slice(0, 5)}-${rest.slice(5)}` : rest;
  return `+55 (${ddd}) ${part}`;
}

/** Link wa.me com mensagem opcional pré-preenchida. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${whatsappDigits()}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Link mailto com assunto opcional. */
export function mailtoLink(subject?: string): string {
  return subject
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CONTACT_EMAIL}`;
}
