export interface SectorSummary {
  cluster: string;
  coverage: number;
  fairnessGap: number;
}

export interface SectorCoverage {
  need: number;
  targeted: number;
  coverage: number;
}

export interface CbpfCountryData {
  iso3: string;
  name: string;
  coordinates: [number, number];
  totalRequired: number;
  totalFunded: number;
  pooledBudget: number;
  food: SectorCoverage;
  health: SectorCoverage;
  nutrition: SectorCoverage;
  combinedNeed: number;
  compositeCoverage: number;
  healthVsFoodGap: number;
  nutritionVsFoodGap: number;
}

const countryCoordinates: Record<string, [number, number]> = {
  AFG: [33.9391, 67.71],
  BFA: [12.2383, -1.5616],
  CAF: [6.6111, 20.9394],
  COD: [-4.0383, 21.7587],
  COL: [4.5709, -74.2973],
  ETH: [9.145, 40.4897],
  GTM: [15.7835, -90.2308],
  HND: [15.2, -86.2419],
  HTI: [18.9712, -72.2852],
  MLI: [17.5707, -3.9962],
  MMR: [21.9162, 95.956],
  MOZ: [-18.6657, 35.5296],
  NGA: [9.082, 8.6753],
  NER: [13.5127, 2.1128],
  SDN: [12.8628, 30.2176],
  SLV: [13.7942, -88.8965],
  SOM: [5.1521, 46.1996],
  SSD: [6.877, 31.307],
  TCD: [15.4542, 18.7322],
  UKR: [48.3794, 31.1656],
  YEM: [15.5527, 48.5164],
  SYR: [34.8021, 38.9968]
};

const countryNames: Record<string, string> = {
  AFG: 'Afghanistan',
  BFA: 'Burkina Faso',
  CAF: 'Central African Republic',
  COD: 'DR Congo',
  COL: 'Colombia',
  ETH: 'Ethiopia',
  GTM: 'Guatemala',
  HND: 'Honduras',
  HTI: 'Haiti',
  MLI: 'Mali',
  MMR: 'Myanmar',
  MOZ: 'Mozambique',
  NGA: 'Nigeria',
  NER: 'Niger',
  SDN: 'Sudan',
  SLV: 'El Salvador',
  SOM: 'Somalia',
  SSD: 'South Sudan',
  TCD: 'Chad',
  UKR: 'Ukraine',
  YEM: 'Yemen',
  SYR: 'Syria'
};

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pct(targeted: number, need: number): number {
  if (need <= 0) return 0;
  return (targeted / need) * 100;
}

export function formatMillions(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatPeople(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return `${value.toFixed(0)}`;
}

export async function loadCbpfData(): Promise<{
  countries: CbpfCountryData[];
  sectorSummary: SectorSummary[];
}> {
  const [masterText, sectorText] = await Promise.all([
    fetch('/data/crisis_compass_v3_master.csv').then((res) => res.text()),
    fetch('/data/crisis_compass_sector_analysis.csv').then((res) => res.text())
  ]);

  const masterRows = parseCsv(masterText);
  const countries: CbpfCountryData[] = masterRows
    .map((row) => {
      const iso3 = row.ISO3;
      const coordinates = countryCoordinates[iso3];
      if (!iso3 || !coordinates) return null;

      const foodNeed = toNumber(row['In Need_2025_FSC']);
      const healthNeed = toNumber(row['In Need_2025_HEA']);
      const nutritionNeed = toNumber(row['In Need_2025_NUT']);

      const foodTargeted = toNumber(row['Targeted_2025_FSC']);
      const healthTargeted = toNumber(row['Targeted_2025_HEA']);
      const nutritionTargeted = toNumber(row['Targeted_2025_NUT']);

      const combinedNeed = foodNeed + healthNeed + nutritionNeed;
      if (combinedNeed <= 0) return null;

      const foodCoverage = pct(foodTargeted, foodNeed);
      const healthCoverage = pct(healthTargeted, healthNeed);
      const nutritionCoverage = pct(nutritionTargeted, nutritionNeed);

      return {
        iso3,
        name: countryNames[iso3] ?? iso3,
        coordinates,
        totalRequired: toNumber(row.total_req_yr),
        totalFunded: toNumber(row.total_funded_yr),
        pooledBudget: toNumber(row.pooled_budget),
        food: { need: foodNeed, targeted: foodTargeted, coverage: foodCoverage },
        health: { need: healthNeed, targeted: healthTargeted, coverage: healthCoverage },
        nutrition: { need: nutritionNeed, targeted: nutritionTargeted, coverage: nutritionCoverage },
        combinedNeed,
        compositeCoverage: (foodCoverage + healthCoverage + nutritionCoverage) / 3,
        healthVsFoodGap: healthCoverage - foodCoverage,
        nutritionVsFoodGap: nutritionCoverage - foodCoverage
      };
    })
    .filter((country): country is CbpfCountryData => country !== null)
    .sort((a, b) => b.combinedNeed - a.combinedNeed);

  const sectorRows = parseCsv(sectorText);
  const selectedClusters = new Set(['Food Security', 'Health', 'Nutrition']);
  const sectorSummary = sectorRows
    .filter((row) => selectedClusters.has(row.cluster))
    .map((row) => ({
      cluster: row.cluster,
      coverage: toNumber(row.coverage) * 100,
      fairnessGap: toNumber(row.fairness_gap)
    }));

  return { countries, sectorSummary };
}
