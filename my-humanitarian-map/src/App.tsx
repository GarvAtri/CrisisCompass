import { useEffect, useMemo, useState } from 'react';
import { Globe, LoaderCircle } from 'lucide-react';
import { WorldMap } from './components/worldMap';
import { RiskCountryPanel } from './components/riskCountryPanel';
import { loadStudyScoredCountries, type StudyCountry } from './data/studyScoredData';

export default function App() {
  const [countries, setCountries] = useState<StudyCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<StudyCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadStudyScoredCountries()
      .then((data) => {
        if (!active) return;
        setCountries(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load study file');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalCountries = countries.length;
    const totalInNeed = countries.reduce((sum, country) => sum + country.totalNeed2025, 0);
    const avgScore = totalCountries > 0
      ? countries.reduce((sum, country) => sum + country.crisisScore, 0) / totalCountries
      : 0;

    return {
      totalCountries,
      totalInNeed,
      avgScore
    };
  }, [countries]);

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#020617', color: '#fff' }}>
        <LoaderCircle size={20} className="animate-spin" />
        <span>Loading study-aligned map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#fca5a5', padding: 24 }}>
        Failed to load data: {error}
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#020617' }}>
      <header style={{ flexShrink: 0, background: '#0f172a', borderBottom: '1px solid #334155', padding: '16px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={28} color="#fbbf24" />
            <div>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>Crisis Compass: Study-Aligned Crisis Score Map</h1>
              <p style={{ margin: '6px 0 0 0', fontSize: 16, color: '#cbd5e1' }}>
                Source: `crisis_compass_final_scored.csv`
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: 15, color: '#cbd5e1' }}>
            <div>Countries shown: <span style={{ color: '#fff' }}>{stats.totalCountries}</span></div>
            <div>Total 2025 need: <span style={{ color: '#fff' }}>{(stats.totalInNeed / 1e6).toFixed(1)}M</span></div>
            <div>Average crisis score: <span style={{ color: '#fff' }}>{stats.avgScore.toFixed(2)}</span></div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        <section style={{ width: selectedCountry ? '66.67%' : '100%', minWidth: 0 }}>
          <WorldMap countries={countries} onCountrySelect={setSelectedCountry} selectedCountry={selectedCountry} />
        </section>

        {selectedCountry && (
          <aside style={{ width: '33.33%', minWidth: 360, borderLeft: '1px solid #334155', background: '#fff' }}>
            <RiskCountryPanel country={selectedCountry} onClose={() => setSelectedCountry(null)} />
          </aside>
        )}
      </main>
    </div>
  );
}
