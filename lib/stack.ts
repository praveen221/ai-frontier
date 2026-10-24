import type { Company } from './schema';

export const SHELL_WIDTH = 'shell-width';
export const SHELL = 'shell';

export const STACK_GROUPS: { title: string; ids: string[] }[] = [
  { title: 'Compute', ids: ['chips-silicon', 'fabs-manufacturing', 'infrastructure-cloud', 'systems-software'] },
  { title: 'Data', ids: ['data-platforms'] },
  { title: 'Models', ids: ['models-frontier', 'models-open', 'models-small', 'models-image', 'models-video', 'models-audio', 'models-robotics'] },
  { title: 'Tooling', ids: ['serving-inference', 'dev-tools', 'agents-memory'] },
  { title: 'Applications', ids: ['apps-coding', 'apps-enterprise', 'apps-vertical', 'apps-creative', 'apps-consumer'] },
  { title: 'Physical', ids: ['robotics-physical', 'autonomous-systems', 'defense-national-security'] },
  { title: 'Society', ids: ['safety-security', 'policy-standards', 'research-institutions', 'capital-investors'] },
];

export function shortLayerName(name: string): string {
  return name.replace(/^(Foundation Models|Applications|Robotics|Data): /, '');
}

export function sourcedAt(company: Company): string | null {
  const dates = [company.funding.date, company.valuation?.date, company.revenue?.date].filter(
    (value): value is string => Boolean(value),
  );
  if (company.identitySource?.date && company.identitySource.date !== company.addedAt) {
    dates.push(company.identitySource.date);
  }
  if (company.updatedAt !== company.addedAt) dates.push(company.updatedAt);
  if (!dates.length) return null;
  return dates.sort().at(-1) ?? null;
}
