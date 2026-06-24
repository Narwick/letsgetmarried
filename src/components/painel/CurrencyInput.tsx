"use client";

import { formatCentsBRL, parseDigitsToCents } from "@/lib/masks";

/**
 * Campo de moeda BRL controlado (estilo calculadora: digitar "1500" = R$ 15,00).
 * Guarda o valor em centavos; vazio = null (valor livre).
 */
export function CurrencyInput({
  valueCents,
  onChange,
  className = "",
  placeholder = "0,00",
  id,
}: {
  valueCents: number | null;
  onChange: (cents: number | null) => void;
  className?: string;
  placeholder?: string;
  id?: string;
}) {
  const display = valueCents != null ? formatCentsBRL(valueCents) : "";

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => onChange(parseDigitsToCents(e.target.value))}
        placeholder={placeholder}
        className={`pl-9 ${className}`}
      />
    </div>
  );
}
