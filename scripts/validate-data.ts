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
  const withIdentity = companies.filter((c) => c.identitySource).length;
  const identityFields = { founders: 0, founded: 0, headquarters: 0 };
  for (const company of companies) {
    for (const field of company.identitySource?.fields ?? []) {
      identityFields[field] += 1;
    }
  }

  const byLayer = new Map<string, number>();
  for (const layer of taxonomy.layers) byLayer.set(layer.id, 0);
  for (const company of companies) {
    for (const layer of company.layers) {
      byLayer.set(layer, (byLayer.get(layer) ?? 0) + 1);
    }
  }

  const regions = new Map<string, number>();
  for (const company of companies) {
    const region = classifyRegion(company.headquarters);
    regions.set(region, (regions.get(region) ?? 0) + 1);
  }

  console.log(`Companies: ${companies.length}`);
  console.log(`  sourced funding: ${withFunding}`);
  console.log(`  sourced valuation: ${withValuation}`);
  console.log(`  sourced revenue: ${withRevenue}`);
  console.log(`  identity source: ${withIdentity}`);
  console.log(`    founders: ${identityFields.founders}`);
  console.log(`    founded: ${identityFields.founded}`);
  console.log(`    headquarters: ${identityFields.headquarters}`);
  console.log('  by layer:');
  for (const layer of taxonomy.layers) {
    console.log(`    ${layer.id}: ${byLayer.get(layer.id) ?? 0}`);
  }
  console.log('  by region:');
  for (const [region, count] of [...regions.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${region}: ${count}`);
  }
  console.log('\nAll data files validated.');
}

function classifyRegion(hq: string): string {
  const value = hq.toLowerCase();
  if (/(india|bengaluru|bangalore|mumbai|delhi|hyderabad|chennai|pune|noida)/.test(value)) return 'India';
  if (/(japan|tokyo|osaka|korea|seoul|seongnam|yongin)/.test(value)) return 'Japan/Korea';
  if (/(uae|dubai|abu dhabi|saudi|riyadh|qatar|doha|israel|tel aviv|neom)/.test(value)) return 'Middle East';
  if (/(brazil|s[aã]o paulo|argentina|buenos|chile|santiago|mexico|colombia|bogot[aá]|uruguay|montevideo)/.test(value)) {
    return 'LatAm';
  }
  if (
    /(uk|united kingdom|london|france|paris|germany|berlin|munich|heidelberg|netherlands|amsterdam|sweden|stockholm|finland|helsinki|switzerland|spain|italy|milan|ireland|dublin|poland|warsaw|austria|vienna|portugal|belgium|denmark|norway|estonia|cambridge, uk|oxford)/.test(
      value,
    )
  ) {
    return 'Europe';
  }
  if (/(china|beijing|shanghai|shenzhen|hangzhou|hong kong|taiwan|hsinchu)/.test(value)) return 'Greater China';
  if (/(usa|united states|canada|toronto|montreal|vancouver)/.test(value)) return 'North America';
  return 'Other';
}

validate();
