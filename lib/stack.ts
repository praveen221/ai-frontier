import type { Company } from './schema';

export const SHELL_WIDTH = 'mx-auto max-w-[1440px]';
export const SHELL = `${SHELL_WIDTH} px-4 sm:px-6`;

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

export function sourcedAt(company: Company): string {
  const dates = [
    company.funding.date,
    company.valuation?.date,
    company.revenue?.date,
    company.identitySource?.date,
    company.updatedAt,
    company.addedAt,
  ].filter((value): value is string => Boolean(value));
  return dates.sort().at(-1) ?? company.updatedAt;
}
