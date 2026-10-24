import { Directory } from '@/components/Directory';
import { StackMap } from '@/components/StackMap';
import { getCompanies, getLayers } from '@/lib/data';

export default function HomePage() {
  const companies = getCompanies();
  const layers = getLayers();

  return (
    <div id="main">
      <StackMap layers={layers} companies={companies} />
      <Directory companies={companies} layers={layers} />
    </div>
  );
}
