/**
 * Gera o "PIX Copia e Cola" (BR Code estático no padrão EMV®QRCPS do Banco Central).
 * Tudo offline — não chama nenhuma API. O convidado paga direto na conta do casal.
 */

/** Remove acentos e limita ao tamanho permitido por cada campo do EMV. */
function sanitize(value: string, maxLen: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acentos
    .replace(/[^A-Za-z0-9 ./-]/g, "") // mantém só caracteres seguros
    .trim()
    .slice(0, maxLen);
}

/** Monta um campo TLV: id (2) + comprimento (2, zero-padded) + valor. */
function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** CRC16-CCITT (polinômio 0x1021, init 0xFFFF) exigido pelo padrão PIX. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export interface PixParams {
  pixKey: string;
  recipientName: string;
  city: string;
  /** Valor em centavos. Omitir/0 = valor livre (ex.: fundo de viagem). */
  amountCents?: number | null;
  /** Identificador opcional da transação (txid). */
  txid?: string;
}

/**
 * Retorna a string do "PIX Copia e Cola" pronta para exibir e para gerar o QR Code.
 */
export function buildPixPayload({
  pixKey,
  recipientName,
  city,
  amountCents,
  txid,
}: PixParams): string {
  const merchantAccount = field(
    "26",
    field("00", "br.gov.bcb.pix") + field("01", pixKey.trim()),
  );

  const additionalData = field("62", field("05", txid?.slice(0, 25) || "***"));

  let payload =
    field("00", "01") + // Payload Format Indicator
    merchantAccount +
    field("52", "0000") + // Merchant Category Code
    field("53", "986"); // Moeda: BRL

  if (amountCents && amountCents > 0) {
    payload += field("54", (amountCents / 100).toFixed(2));
  }

  payload +=
    field("58", "BR") +
    field("59", sanitize(recipientName, 25)) +
    field("60", sanitize(city, 15)) +
    additionalData +
    "6304"; // ID + len do CRC; o valor é calculado sobre tudo isso

  return payload + crc16(payload);
}
