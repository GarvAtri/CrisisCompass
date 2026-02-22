import { formatMillions, formatPeople, type CbpfCountryData, type SectorSummary } from '../data/cbpfData';

interface CbpfCountryPanelProps {
  country: CbpfCountryData | null;
  countries: CbpfCountryData[];
  sectorSummary: SectorSummary[];
}

function barColor(value: number): string {
  if (value < 20) return 'bg-red-500';
  if (value < 40) return 'bg-orange-500';
  if (value < 60) return 'bg-yellow-500';
  return 'bg-green-600';
}

function coverageBar(label: string, value: number) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor(value)}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function CbpfCountryPanel({ country, countries, sectorSummary }: CbpfCountryPanelProps) {
  const avgComposite = countries.length
    ? countries.reduce((sum, item) => sum + item.compositeCoverage, 0) / countries.length
    : 0;

  const lagCountries = countries.filter((item) => item.healthVsFoodGap < -10).length;
  const leadCountries = countries.filter((item) => item.healthVsFoodGap > 10).length;

  const summaryMap = Object.fromEntries(sectorSummary.map((entry) => [entry.cluster, entry]));

  if (!country) {
    return (
      <div className="h-full overflow-y-auto bg-white p-6 space-y-5">
        <div>
          <h2 className="text-xl mb-1">CBPF Nations: Food-Health-Nutrition Correlation</h2>
          <p className="text-sm text-slate-600">
            Select a country marker to inspect sector alignment and coverage signals.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Countries in map</div>
            <div className="text-2xl">{countries.length}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Average composite coverage</div>
            <div className="text-2xl">{avgComposite.toFixed(1)}%</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-red-600 text-xs">Health lagging food (&lt; -10pp)</div>
            <div className="text-2xl text-red-700">{lagCountries}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-green-700 text-xs">Health leading food (&gt; +10pp)</div>
            <div className="text-2xl text-green-700">{leadCountries}</div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm mb-2">Global 2025 Cluster Context (from sector analysis)</h3>
          <div className="space-y-3">
            {['Food Security', 'Health', 'Nutrition'].map((cluster) => {
              const entry = summaryMap[cluster] as SectorSummary | undefined;
              const coverage = entry?.coverage ?? 0;
              return (
                <div key={cluster}>
                  {coverageBar(`${cluster} coverage`, coverage)}
                  <div className="text-[11px] text-slate-500 mt-1">
                    Fairness gap: {entry ? entry.fairnessGap.toFixed(3) : 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const fundedPct = country.totalRequired > 0 ? (country.totalFunded / country.totalRequired) * 100 : 0;

  return (
    <div className="h-full overflow-y-auto bg-white p-6 space-y-5">
      <div>
        <h2 className="text-2xl mb-1">{country.name}</h2>
        <p className="text-sm text-slate-600">CBPF nation correlation profile</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-slate-500 text-xs">Total funded</div>
          <div className="text-xl">{formatMillions(country.totalFunded)}</div>
          <div className="text-xs text-slate-500">{fundedPct.toFixed(1)}% of requirement</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-slate-500 text-xs">Combined need (F+H+N)</div>
          <div className="text-xl">{formatPeople(country.combinedNeed)}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-slate-500 text-xs">Composite coverage</div>
          <div className="text-xl">{country.compositeCoverage.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-slate-500 text-xs">Pooled budget</div>
          <div className="text-xl">{formatMillions(country.pooledBudget)}</div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm">Sector Coverage</h3>
        {coverageBar('Food security', country.food.coverage)}
        {coverageBar('Health', country.health.coverage)}
        {coverageBar('Nutrition', country.nutrition.coverage)}
      </div>

      <div className="border border-slate-200 rounded-lg p-4 space-y-2">
        <h3 className="text-sm">Correlation Signal</h3>
        <div className="text-sm text-slate-700">
          Health vs Food: <span className={country.healthVsFoodGap < 0 ? 'text-red-600' : 'text-green-700'}>{country.healthVsFoodGap.toFixed(1)} pp</span>
        </div>
        <div className="text-sm text-slate-700">
          Nutrition vs Food: <span className={country.nutritionVsFoodGap < 0 ? 'text-red-600' : 'text-green-700'}>{country.nutritionVsFoodGap.toFixed(1)} pp</span>
        </div>
      </div>
    </div>
  );
}
