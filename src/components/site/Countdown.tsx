"use client";

import { useEffect, useState } from "react";

function calc(targetISO: string) {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    min: Math.floor((diff % 3600000) / 60000),
    seg: Math.floor((diff % 60000) / 1000),
  };
}

export function Countdown({ targetISO }: { targetISO: string }) {
  const [c, setC] = useState(() => calc(targetISO));

  useEffect(() => {
    const t = setInterval(() => setC(calc(targetISO)), 1000);
    return () => clearInterval(t);
  }, [targetISO]);

  const items: [string, number][] = [
    ["dias", c.dias],
    ["horas", c.horas],
    ["min", c.min],
    ["seg", c.seg],
  ];

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-4">
      {items.map(([label, value], i) => (
        <div key={label} className="flex items-start gap-3 sm:gap-4">
          {i > 0 && (
            <span className="font-serif text-3xl text-[var(--ink-accent)] opacity-50">:</span>
          )}
          <div className="flex min-w-[58px] flex-col items-center">
            <span className="font-serif text-4xl leading-none text-white sm:text-5xl">
              {String(value).padStart(2, "0")}
            </span>
            <span className="mt-2 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--ink-accent)]">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
