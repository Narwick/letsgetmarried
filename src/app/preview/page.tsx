import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SiteView } from "@/components/site/SiteView";
import type { Gift, Rsvp, Wedding } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Pré-visualização do site do casal logado (rascunho ou publicado). */
export default async function PreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!wedding) {
    return (
      <div className="p-10 text-center text-sm text-stone-600">
        Você ainda não tem um site. <Link href="/painel/editar" className="underline">Comece aqui</Link>.
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: g }, { data: r }] = await Promise.all([
    admin.from("gifts").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: true }),
    admin.from("rsvps").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: false }),
  ]);

  return (
    <SiteView
      wedding={wedding as Wedding}
      gifts={(g ?? []) as Gift[]}
      rsvps={(r ?? []) as Rsvp[]}
      isPreview={wedding.status !== "published"}
    />
  );
}
