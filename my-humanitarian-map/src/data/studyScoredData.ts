export interface StudyCountry {
  code: string;
  name: string;
  coordinates: [number, number];
  crisisScore: number;
  rank: number;
  absorption: number;
  healthCoverage: number;
  foodCoverage: number;
  nutritionCoverage: number;
  healthGapUsd: number;
  foodGapUsd: number;
  totalRequiredUsd: number;
  totalFundedUsd: number;
  pooledDependency: number;
  healthNeed2025: number;
  foodNeed2025: number;
  nutritionNeed2025: number;
  totalNeed2025: number;
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
  SSD: [6.877, 31.307],
  TCD: [15.4542, 18.7322],
  UKR: [48.3794, 31.1656],
  SOM: [5.1521, 46.1996],
  SLV: [13.7942, -88.8965]
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
  SSD: 'South Sudan',
  TCD: 'Chad',
  UKR: 'Ukraine',
  SOM: 'Somalia',
  SLV: 'El Salvador'
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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

export async function loadStudyScoredCountries(): Promise<StudyCountry[]> {
  const csvText = await fetch('/data/crisis_compass_final_scored.csv').then((res) => res.text());
  const rows = parseCsv(csvText);

  return rows
    .map((row) => {
      const code = row.ISO3;
      const coordinates = countryCoordinates[code];
      if (!code || !coordinates) return null;

      const healthNeed2025 = toNumber(row.health_need_25);
      const foodNeed2025 = toNumber(row.food_need_25);
      const nutritionNeed2025 = toNumber(row.nutrition_need_25);
      const totalNeed2025 = healthNeed2025 + foodNeed2025 + nutritionNeed2025;

      return {
        code,
        name: countryNames[code] ?? code,
        coordinates,
        crisisScore: clamp(toNumber(row.crisis_score), 0, 1),
        rank: toNumber(row.rank),
        absorption: clamp(toNumber(row.absorption), 0, 1),
        healthCoverage: toNumber(row.health_coverage) * 100,
        foodCoverage: toNumber(row.food_coverage) * 100,
        nutritionCoverage: toNumber(row.nutrition_coverage) * 100,
        healthGapUsd: toNumber(row.health_gap),
        foodGapUsd: toNumber(row.food_gap),
        totalRequiredUsd: toNumber(row.total_req),
        totalFundedUsd: toNumber(row.total_fund),
        pooledDependency: toNumber(row.pooled_dependency),
        healthNeed2025,
        foodNeed2025,
        nutritionNeed2025,
        totalNeed2025
      };
    })
    .filter((country): country is StudyCountry => country !== null)
    .sort((a, b) => a.rank - b.rank);
}
