import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Directory } from '@/components/Directory';
import { getCompanies, getLayerById, getLayers } from '@/lib/data';
import { SHELL } from '@/lib/stack';

export function generateStaticParams() {
  return getLayers().map((layer) => ({ id: layer.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const layer = getLayerById(id);
  if (!layer) return { title: 'Not found' };
  return {
    title: layer.name,
    description: layer.description,
    openGraph: {
      title: layer.name,
      description: layer.description,
      images: [{ url: `/og/${layer.id}.png`, width: 1200, height: 630, alt: layer.name }],
    },
  };
}

export default async function LayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const layer = getLayerById(id);
  if (!layer) notFound();

  return (
    <div id="main">
      <div className="border-b border-border">
        <div className={`${SHELL} py-8`}>
          <Link href="/taxonomy/" className="text-[14px] text-primary">
            ← All layers
          </Link>
          <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em]">{layer.name}</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{layer.description}</p>
        </div>
      </div>
      <Directory companies={getCompanies()} layers={getLayers()} initialLayer={layer.id} hideHero />
    </div>
  );
}
