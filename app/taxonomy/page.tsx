import type { Metadata } from 'next';
import Link from 'next/link';
import { getCompanies, getLayers } from '@/lib/data';
import { SHELL } from '@/lib/stack';

export const metadata: Metadata = {
  title: 'Taxonomy',
  description: 'A non-overlapping, bottom-up map of the AI stack.',
};

export default function TaxonomyPage() {
  const layers = getLayers();
  const companies = getCompanies();

  return (
    <main id="main" className={`${SHELL} py-12`}>
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-primary">Taxonomy</p>
      <div className="mt-3 flex flex-col justify-between gap-6 border-b border-border pb-10 md:flex-row md:items-end">
        <h1 className="max-w-xl text-[36px] font-semibold leading-[1.15] tracking-[-0.03em]">
          Distinct layers. One-line explainers.
        </h1>
        <p className="max-w-sm text-[15px] text-muted-foreground">
          Compute and chips, then infrastructure, data, models (split by what they actually make),
          tooling, applications, and the institutions around them. Research labs are not companies.
        </p>
      </div>
      <ol className="mt-8 space-y-4">
        {layers.map((layer) => {
          const count = companies.filter((c) => c.layers.includes(layer.id)).length;
          return (
            <li key={layer.id} id={layer.id} className="rounded-xl border border-border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[13px] text-muted-foreground">
                  {String(layer.order).padStart(2, '0')}
                </p>
                <Link href={`/layer/${layer.id}/`} className="text-[14px] text-primary">
                  {count} {count === 1 ? 'entry' : 'entries'} →
                </Link>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                <Link href={`/layer/${layer.id}/`} className="hover:text-primary">
                  {layer.name}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] text-muted-foreground">{layer.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {layer.subdomains.map((item) => (
                  <li
                    key={item}
                    className="rounded-md bg-secondary px-2 py-1 text-[13px] text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
