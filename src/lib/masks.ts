/**
 * Funções de máscara/formatação para os campos do painel.
 * Tudo aqui é puro (sem React) para poder ser usado em qualquer lugar.
 */

/** Formata centavos (inteiro) como número BRL para exibição: 1599 -> "15,99". */
export function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Lê o que o usuário digitou num campo de moeda (estilo calculadora) e devolve centavos. */
export function parseDigitsToCents(input: string): number | null {
  const digits = input.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : null;
}

/** Máscara de horário "HHhMM" a partir dos dígitos digitados: "1600" -> "16h00". */
export function maskTime(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}h${d.slice(2)}`;
}

/** Mantém só dígitos, no máximo 4 (ano): "2o19!" -> "219". */
export function maskYear(input: string): string {
  return input.replace(/\D/g, "").slice(0, 4);
}
