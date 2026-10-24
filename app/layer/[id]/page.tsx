import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Directory } from '@/components/Directory';
import { getCompanies, getLayerById, getLayers } from '@/lib/data';

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
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
          <Link href="/taxonomy/" className="text-[13px] text-primary">
            ← All layers
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{layer.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{layer.description}</p>
        </div>
      </div>
      <Directory companies={getCompanies()} layers={getLayers()} initialLayer={layer.id} />
    </>
  );
}
