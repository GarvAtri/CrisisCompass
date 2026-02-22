import { useEffect, useMemo, useState } from 'react';
import { Globe, LoaderCircle, BarChart3 } from 'lucide-react';
import { WorldMap } from './components/worldMap';
import { RiskCountryPanel } from './components/riskCountryPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { GeminiChat } from './components/GeminiChat';
import { loadStudyScoredCountries, type StudyCountry } from './data/studyScoredData';

type ViewType = 'map' | 'analytics';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('map');
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
        <span>Loading CrisisCompass...</span>
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

  if (currentView === 'analytics') {
    return <AnalyticsDashboard onBack={() => setCurrentView('map')} />;
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#020617' }}>
      <header style={{ flexShrink: 0, background: '#0f172a', borderBottom: '1px solid #334155', padding: '16px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={28} color="#fbbf24" />
            <div>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>Crisis Compass</h1>
              <p style={{ margin: '6px 0 0 0', fontSize: 16, color: '#cbd5e1' }}>
                Humanitarian Health Funding Analysis
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'right', fontSize: 15, color: '#cbd5e1' }}>
              <div>Countries: <span style={{ color: '#fff' }}>{stats.totalCountries}</span></div>
              <div>Total 2025 need: <span style={{ color: '#fff' }}>{(stats.totalInNeed / 1e6).toFixed(1)}M</span></div>
              <div>Avg crisis score: <span style={{ color: '#fff' }}>{stats.avgScore.toFixed(2)}</span></div>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setCurrentView('map')}
                style={{
                  padding: '8px 16px',
                  background: currentView === 'map' ? '#fbbf24' : '#374151',
                  color: currentView === 'map' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                <Globe size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Map
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                style={{
                  padding: '8px 16px',
                  background: currentView === 'analytics' ? '#fbbf24' : '#374151',
                  color: currentView === 'analytics' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                <BarChart3 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Analytics
              </button>
            </div>
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
      
      {/* AI Chat Assistant for Map View */}
      <GeminiChat 
        crisisData={countries} 
        selectedCountry={selectedCountry?.name} 
        currentChart="World Map" 
      />
    </div>
  );
}