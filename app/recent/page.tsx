import type { Metadata } from 'next';
import Link from 'next/link';
import { getCompanies } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Recently added',
  description: 'Newest and recently updated entries in the AI Frontier directory.',
};

export default function RecentPage() {
  const companies = getCompanies()
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.addedAt.localeCompare(a.addedAt));
  const recent = companies.slice(0, 48);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Recently added / updated</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The latest {recent.length} records by <code>addedAt</code> / <code>updatedAt</code>.
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {recent.map((company) => (
          <li key={company.id} className="flex items-start gap-3 py-4">
            <Logo name={company.name} website={company.website} />
            <div>
              <Link href={`/company/${company.id}/`} className="font-medium hover:text-primary">
                {company.name}
              </Link>
              <p className="text-[12px] text-muted-foreground">
                Added {formatDate(company.addedAt)} · Updated {formatDate(company.updatedAt)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{company.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
