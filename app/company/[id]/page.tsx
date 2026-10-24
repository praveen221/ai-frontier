import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanies, getCompanyById, getLayers } from '@/lib/data';
import { entityLabel, formatDate, hostFromUrl } from '@/lib/format';
import { SHELL, shortLayerName } from '@/lib/stack';
import { IconExternal } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { SourceLink } from '@/components/SourceLink';

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
    .map((layerId) => layers.find((layer) => layer.id === layerId))
    .filter(Boolean);
  const identity = company.identitySource;
  const showDates = company.addedAt !== company.updatedAt;
  const subdomains = [...new Set(company.subdomains)];

  return (
    <main id="main" className={`${SHELL} py-10`}>
      <Link href="/" className="text-[14px] text-primary">
        ← Directory
      </Link>

      <header className="mt-8 flex items-start gap-4">
        <Logo name={company.name} website={company.website} size={48} />
        <div className="min-w-0">
          <p className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
            {entityLabel(company.entityType)}
          </p>
          <h1 className="text-[36px] font-semibold tracking-[-0.03em]">{company.name}</h1>
          {company.fullName && company.fullName !== company.name && (
            <p className="mt-1 text-[15px] text-muted-foreground">{company.fullName}</p>
          )}
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[14px] text-primary"
          >
            {hostFromUrl(company.website)}
            <IconExternal />
          </a>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-[16px] leading-relaxed">{company.description}</p>
          {company.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {company.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-2 py-1 text-[13px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-[15px] font-semibold">Layers</h2>
            <ul className="mt-4 space-y-3">
              {layerRecords.map((layer) => (
                <li key={layer!.id}>
                  <Link href={`/layer/${layer!.id}/`} className="font-medium text-primary">
                    {layer!.name}
                  </Link>
                  <p className="text-[14px] text-muted-foreground">{layer!.description}</p>
                </li>
              ))}
            </ul>
            {subdomains.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {subdomains.map((item) => (
                  <span key={item} className="rounded-md bg-secondary px-2 py-1 text-[13px]">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <h2 className="text-[15px] font-semibold">Key facts</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
            <Fact
              label="Founded"
              value={String(company.founded)}
              source={identity?.fields.includes('founded') ? identity : undefined}
            />
            <Fact
              label="Headquarters"
              value={company.headquarters}
              source={identity?.fields.includes('headquarters') ? identity : undefined}
            />
            <Fact
              label="Founders"
              value={company.founders.join(', ')}
              source={identity?.fields.includes('founders') ? identity : undefined}
              wide
            />
            {company.funding.total && (
              <Fact
                label="Funding"
                value={
                  <>
                    {company.funding.total}
                    {company.funding.stage ? (
                      <span className="block text-[13px] font-normal text-muted-foreground">
                        {company.funding.stage}
                      </span>
                    ) : null}
                  </>
                }
                source={
                  company.funding.source && company.funding.date
                    ? { source: company.funding.source, date: company.funding.date }
                    : undefined
                }
              />
            )}
            {company.valuation && (
              <Fact
                label="Valuation"
                value={
                  <>
                    {company.valuation.amount}
                    {company.valuation.notes ? (
                      <span className="block text-[13px] font-normal text-muted-foreground">
                        {company.valuation.notes}
                      </span>
                    ) : null}
                  </>
                }
                source={company.valuation}
              />
            )}
            {company.revenue && (
              <Fact
                label="Revenue"
                value={
                  <>
                    {company.revenue.amount}
                    <span className="block text-[13px] font-normal text-muted-foreground">
                      {company.revenue.period}
                      {company.revenue.notes ? ` · ${company.revenue.notes}` : ''}
                    </span>
                  </>
                }
                source={company.revenue}
                wide
              />
            )}
            {company.funding.investors.length > 0 && (
              <Fact label="Investors" value={company.funding.investors.join(', ')} wide />
            )}
          </dl>
          {layerRecords.length > 0 && (
            <p className="mt-6 text-[13px] text-muted-foreground">
              {layerRecords.map((layer) => shortLayerName(layer!.name)).join(' · ')}
            </p>
          )}
        </aside>
      </div>

      {showDates && (
        <p className="mt-12 text-[13px] text-muted-foreground">
          Added {formatDate(company.addedAt)} · Updated {formatDate(company.updatedAt)}. Figures without a
          public source are left empty.
        </p>
      )}
    </main>
  );
}

function Fact({
  label,
  value,
  source,
  wide,
}: {
  label: string;
  value: ReactNode;
  source?: { source: string; date: string };
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-2' : undefined}>
      <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-[15px] font-medium">{value}</dd>
      {source && (
        <div className="mt-1">
          <SourceLink href={source.source} date={source.date} />
        </div>
      )}
    </div>
  );
}
