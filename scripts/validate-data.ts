import * as fs from 'fs';
import * as path from 'path';
import { CompaniesSchema, TaxonomySchema, type Company, type Taxonomy } from '../lib/schema';

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadCompanies(): Company[] {
  const dir = path.join(process.cwd(), 'data', 'companies');
  const file = path.join(process.cwd(), 'data', 'companies.json');
  const collected: Company[] = [];

  if (fs.existsSync(file)) {
    const parsed = readJson(file) as { companies?: Company[] };
    collected.push(...(parsed.companies ?? []));
  }

  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
      const parsed = readJson(path.join(dir, name)) as { companies?: Company[] } | Company[];
      collected.push(...(Array.isArray(parsed) ? parsed : parsed.companies ?? []));
    }
  }

  return collected;
}

function validate() {
  console.log('Validating data files...\n');
  let failed = false;

  const taxonomyPath = path.join(process.cwd(), 'data', 'taxonomy.json');
  const taxonomyRaw = readJson(taxonomyPath);
  const taxonomyResult = TaxonomySchema.safeParse(taxonomyRaw);
  if (!taxonomyResult.success) {
    console.error('Taxonomy validation failed:');
    console.error(taxonomyResult.error.format());
    process.exit(1);
  }

  const taxonomy: Taxonomy = taxonomyResult.data;
  const layerIds = new Set(taxonomy.layers.map((layer) => layer.id));
  const subdomainByLayer = new Map(
    taxonomy.layers.map((layer) => [layer.id, new Set(layer.subdomains)]),
  );

  console.log(`Taxonomy: ${taxonomy.layers.length} layers, ${taxonomy.layers.reduce((n, l) => n + l.subdomains.length, 0)} subdomains`);

  const companies = loadCompanies();
  const wrapped = CompaniesSchema.safeParse({ companies });
  if (!wrapped.success) {
    console.error('Companies validation failed:');
    console.error(wrapped.error.format());
    failed = true;
  }

  const ids = new Set<string>();
  for (const company of companies) {
    if (ids.has(company.id)) {
      console.error(`Duplicate company id: ${company.id}`);
      failed = true;
    }
    ids.add(company.id);

    for (const layer of company.layers) {
      if (!layerIds.has(layer)) {
        console.error(`${company.id}: unknown layer "${layer}"`);
        failed = true;
      }
    }

    for (const subdomain of company.subdomains) {
      const known = company.layers.some((layer) => subdomainByLayer.get(layer)?.has(subdomain));
      if (!known) {
        console.error(`${company.id}: subdomain "${subdomain}" is not in any of its layers`);
        failed = true;
      }
    }
  }

  if (failed) {
    console.error('\nValidation failed.');
    process.exit(1);
  }

  const withValuation = companies.filter((c) => c.valuation).length;
  const withRevenue = companies.filter((c) => c.revenue).length;
  const withFunding = companies.filter((c) => c.funding.total && c.funding.source).length;

  console.log(`Companies: ${companies.length}`);
  console.log(`  sourced funding: ${withFunding}`);
  console.log(`  sourced valuation: ${withValuation}`);
  console.log(`  sourced revenue: ${withRevenue}`);
  console.log('\nAll data files validated.');
}

validate();
