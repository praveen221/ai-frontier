import type { Company } from './schema';
export { REPO_URL, SITE_URL } from './site';

export function logoUrl(website: string): string {
  try {
    const host = new URL(website).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return '';
  }
}

export function hostFromUrl(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

export function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function initials(name: string): string {
  const parts = name.replace(/[().]/g, '').split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function entityLabel(type: Company['entityType']): string {
  switch (type) {
    case 'research':
      return 'Research lab';
    case 'institution':
      return 'Institution';
    case 'investor':
      return 'Investor';
    default:
      return 'Company';
  }
}
