import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanies, getCompanyById, getLayers } from '@/lib/data';
import { entityLabel, formatDate, hostFromUrl } from '@/lib/format';
import { IconExternal } from '@/components/Icons';
import { Logo } from '@/components/Logo';

export function generateStaticParams() {
  return getCompanies().map((company) => ({ id: company.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) return { title: 'Not found' };
  return {
    title: company.name,
    description: company.description,
    openGraph: {
      title: company.name,
      description: company.description,
      url: `/company/${company.id}/`,
      images: [{ url: `/og/${company.id}.png`, width: 1200, height: 630, alt: company.name }],
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompanyById(id);
  const layers = getLayers();
  if (!company) notFound();

  const layerRecords = company.layers
    .map((id) => layers.find((layer) => layer.id === id))
    .filter(Boolean);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-[13px] text-primary">
        ← Directory
      </Link>

      <div className="mt-8 flex items-start gap-4">
        <Logo name={company.name} website={company.website} size={48} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {entityLabel(company.entityType)}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">{company.name}</h1>
          {company.fullName && company.fullName !== company.name && (
            <p className="mt-1 text-muted-foreground">{company.fullName}</p>
          )}
        </div>
      </div>

      <p className="mt-6 text-base leading-relaxed">{company.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {company.tags.map((tag) => (
          <span key={tag} className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <Fact
          label="Founded"
          value={String(company.founded)}
          source={company.identitySource?.fields.includes('founded') ? company.identitySource : undefined}
        />
        <Fact
          label="Headquarters"
          value={company.headquarters}
          source={company.identitySource?.fields.includes('headquarters') ? company.identitySource : undefined}
        />
        <Fact
          label="Founders"
          value={company.founders.join(', ')}
          source={company.identitySource?.fields.includes('founders') ? company.identitySource : undefined}
        />
        <Fact
          label="Website"
          value={
            <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">
              {hostFromUrl(company.website)}
              <IconExternal />
            </a>
          }
        />
      </dl>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-sm font-semibold">Capital (sourced only)</h2>
        <div className="mt-4 space-y-4">
          <Sourced
            label="Funding"
            value={company.funding.total ?? 'Not disclosed'}
            extra={company.funding.stage}
            source={company.funding.source}
            date={company.funding.date}
          />
          {company.valuation && (
            <Sourced
              label="Valuation"
              value={company.valuation.amount}
              extra={company.valuation.notes}
              source={company.valuation.source}
              date={company.valuation.date}
            />
          )}
          {company.revenue && (
            <Sourced
              label="Revenue"
              value={company.revenue.amount}
              extra={`${company.revenue.period}${company.revenue.notes ? ` · ${company.revenue.notes}` : ''}`}
              source={company.revenue.source}
              date={company.revenue.date}
            />
          )}
          {company.funding.investors.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Investors</p>
              <p className="mt-1 text-sm">{company.funding.investors.join(', ')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-sm font-semibold">Layers</h2>
        <ul className="mt-4 space-y-3">
          {layerRecords.map((layer) => (
            <li key={layer!.id}>
              <Link href={`/layer/${layer!.id}/`} className="font-medium text-primary">
                {layer!.name}
              </Link>
              <p className="text-sm text-muted-foreground">{layer!.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {company.subdomains.map((item) => (
            <span key={item} className="rounded border border-border px-2 py-1 text-[11px]">
              {item}
            </span>
          ))}
        </div>
      </section>

      <p className="mt-10 text-[12px] text-muted-foreground">
        Added {formatDate(company.addedAt)} · Updated {formatDate(company.updatedAt)}. Figures without a
        public source are left empty.
      </p>
    </main>
  );
}

function Fact({
  label,
  value,
  source,
}: {
  label: string;
  value: ReactNode;
  source?: { source: string; date: string };
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
      {source && (
        <a
          href={source.source}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-primary"
        >
          Source · {formatDate(source.date)}
          <IconExternal />
        </a>
      )}
    </div>
  );
}

function Sourced({
  label,
  value,
  extra,
  source,
  date,
}: {
  label: string;
  value: string;
  extra?: string;
  source?: string;
  date?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {extra && <p className="text-sm text-muted-foreground">{extra}</p>}
      {source && date ? (
        <a href={source} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-primary">
          Source · {formatDate(date)}
          <IconExternal />
        </a>
      ) : (
        <p className="mt-2 text-[12px] text-muted-foreground">No public figure sourced.</p>
      )}
    </div>
  );
}
