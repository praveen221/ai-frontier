import { getCompanies, getLayers } from '@/lib/data';
import { CommandPalette } from './CommandPalette';

export function PaletteHost() {
  return (
    <CommandPalette
      companies={getCompanies().map((company) => ({ id: company.id, name: company.name }))}
      layers={getLayers().map((layer) => ({ id: layer.id, name: layer.name }))}
    />
  );
}
