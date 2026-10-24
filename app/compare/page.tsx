import type { Metadata } from 'next';
import { CompareClient } from '@/components/CompareClient';
import { getCompanies, getLayers } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Compare',
  description: 'Compare two to four AI companies side by side.',
};

export default function ComparePage() {
  return <CompareClient companies={getCompanies()} layers={getLayers()} />;
}
