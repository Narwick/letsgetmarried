"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Mostra o QR Code (gerado no navegador a partir do payload) e o "copia e cola".
 */
export function PixCard({ payload, size = 220 }: { payload: string; size?: number }) {
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(payload, { width: size, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [payload, size]);

  async function copy() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt="QR Code PIX" width={size} height={size} className="rounded-lg" />
      )}
      <button
        onClick={copy}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
      >
        {copied ? "Copiado!" : "Copiar código PIX"}
      </button>
    </div>
  );
}
