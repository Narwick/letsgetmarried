import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marca como 'expired' os sites cujo prazo de 1 ano já passou.
 * Disparado pelo Vercel Cron (ver vercel.json). Protegido por CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("expire_weddings");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ expired: data ?? 0 });
}
