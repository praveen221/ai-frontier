import Link from 'next/link';
import type { Company, TaxonomyLayer } from '@/lib/schema';
import { SHELL, STACK_GROUPS, shortLayerName } from '@/lib/stack';

export function StackMap({
  layers,
  companies,
}: {
  layers: TaxonomyLayer[];
  companies: Company[];
}) {
  const byId = new Map(layers.map((layer) => [layer.id, layer]));
  const counts = new Map(
    layers.map((layer) => [layer.id, companies.filter((c) => c.layers.includes(layer.id)).length]),
  );

  return (
    <section className="hidden border-b border-border md:block">
      <div className={`${SHELL} py-7`}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-primary">The stack</p>
            <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em]">
              Bottom-up, no overlapping buckets.
            </h2>
          </div>
          <Link href="/taxonomy/" className="shrink-0 text-[14px] text-primary hover:underline">
            Full taxonomy →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {STACK_GROUPS.map((group) => (
            <div key={group.title} className="rounded-lg border border-border bg-background px-3 py-3">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.ids.map((id) => {
                  const layer = byId.get(id);
                  if (!layer) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={`/layer/${id}/`}
                        className="flex items-center justify-between gap-2 rounded-md px-1 py-1 text-[13px] leading-snug hover:bg-accent"
                      >
                        <span className="min-w-0">{shortLayerName(layer.name)}</span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {counts.get(id) ?? 0}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
