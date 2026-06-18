import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SiteView } from "@/components/site/SiteView";
import type { Gift, Rsvp, Wedding } from "@/lib/types";

// Os dados do site publicado ficam em cache por 120s (data cache). Isso limita
// as leituras no Supabase a ~1 a cada 2 min por site, independentemente do
// volume de convidados. O dono vê alterações na hora pelo /preview (dinâmico);
// o público reflete em até 2 min. Esta rota não lê cookies.
export const revalidate = 120;
const CACHE_TTL = 120;

interface SiteData {
  wedding: Wedding;
  gifts: Gift[];
  rsvps: Rsvp[];
}

async function loadPublishedSite(slug: string): Promise<SiteData | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  const wedding = (data as Wedding) ?? null;
  if (!wedding) return null;

  const [{ data: g }, { data: r }] = await Promise.all([
    admin.from("gifts").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: true }),
    admin.from("rsvps").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: false }),
  ]);
  return { wedding, gifts: (g ?? []) as Gift[], rsvps: (r ?? []) as Rsvp[] };
}

/** Versão cacheada (data cache do Next), por slug. */
function fetchPublishedSite(slug: string): Promise<SiteData | null> {
  return unstable_cache(() => loadPublishedSite(slug), ["published-site", slug], {
    revalidate: CACHE_TTL,
  })();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await fetchPublishedSite(slug);
  if (!site) return { title: "Site não encontrado" };
  const { wedding } = site;
  return {
    title: wedding.couple_names ? `${wedding.couple_names} — Casamento` : "Nosso Casamento",
    description: wedding.story?.slice(0, 150) ?? undefined,
  };
}

export default async function PublicSite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await fetchPublishedSite(slug);
  if (!site) notFound();
  return <SiteView wedding={site.wedding} gifts={site.gifts} rsvps={site.rsvps} isPreview={false} />;
}
