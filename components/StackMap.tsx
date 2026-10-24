import Link from 'next/link';
import type { Company, TaxonomyLayer } from '@/lib/schema';

const GROUPS: { title: string; ids: string[] }[] = [
  { title: 'Compute', ids: ['chips-silicon', 'fabs-manufacturing', 'infrastructure-cloud', 'systems-software'] },
  { title: 'Data', ids: ['data-platforms'] },
  { title: 'Models', ids: ['models-frontier', 'models-open', 'models-small', 'models-image', 'models-video', 'models-audio', 'models-robotics'] },
  { title: 'Tooling', ids: ['serving-inference', 'dev-tools', 'agents-memory'] },
  { title: 'Applications', ids: ['apps-coding', 'apps-enterprise', 'apps-vertical', 'apps-creative', 'apps-consumer'] },
  { title: 'Physical', ids: ['robotics-physical', 'autonomous-systems', 'defense-national-security'] },
  { title: 'Society', ids: ['safety-security', 'policy-standards', 'research-institutions', 'capital-investors'] },
];

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
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.12em] text-primary">The stack</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Bottom-up, no overlapping buckets.</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {GROUPS.map((group) => (
            <div key={group.title} className="rounded-lg border border-border bg-background p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{group.title}</p>
              <ul className="space-y-1">
                {group.ids.map((id) => {
                  const layer = byId.get(id);
                  if (!layer) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={`/layer/${id}/`}
                        className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-[12px] hover:bg-accent"
                      >
                        <span className="truncate">{layer.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{counts.get(id) ?? 0}</span>
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
