import type { Metadata } from 'next';
import Link from 'next/link';
import { getCompanies } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { SHELL, sourcedAt } from '@/lib/stack';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Recently sourced',
  description: 'Entries whose public figures were sourced most recently.',
};

export default function RecentPage() {
  const ranked = getCompanies()
    .map((company) => ({ company, at: sourcedAt(company) }))
    .filter((row): row is { company: (typeof row)['company']; at: string } => Boolean(row.at))
    .sort((a, b) => b.at.localeCompare(a.at) || a.company.name.localeCompare(b.company.name))
    .slice(0, 20);

  const groups = new Map<string, typeof ranked>();
  for (const row of ranked) {
    const list = groups.get(row.at) ?? [];
    list.push(row);
    groups.set(row.at, list);
  }

  return (
    <main id="main" className={`${SHELL} py-12`}>
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-primary">Recent</p>
      <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em]">Recently sourced</h1>
      <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
        The latest sourced figures in the directory — funding, valuation, and identity as-of dates,
        not the day a record was first imported.
      </p>
      <div className="mt-10 space-y-10">
        {[...groups.entries()].map(([date, rows]) => (
          <section key={date}>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {formatDate(date)}
            </h2>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {rows.map(({ company }) => (
                <li key={company.id} className="flex items-start gap-3 py-3.5">
                  <Logo name={company.name} website={company.website} />
                  <div className="min-w-0">
                    <Link href={`/company/${company.id}/`} className="font-medium hover:text-primary">
                      {company.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-2 text-[14px] text-muted-foreground">{company.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
