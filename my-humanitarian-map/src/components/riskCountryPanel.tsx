import { formatCurrency, formatNumber, type StudyCountry } from '../data/studyScoredData';

interface RiskCountryPanelProps {
  country: StudyCountry;
  onClose: () => void;
}

function riskLabel(score: number): string {
  if (score >= 0.6) return 'Extreme';
  if (score >= 0.5) return 'High';
  if (score >= 0.4) return 'Elevated';
  if (score >= 0.3) return 'Moderate';
  return 'Lower';
}

function pct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function RiskCountryPanel({ country, onClose }: RiskCountryPanelProps) {
  const totalNeed = country.totalNeed2025;
  const foodShare = totalNeed > 0 ? (country.foodNeed2025 / totalNeed) * 100 : 0;
  const nutritionShare = totalNeed > 0 ? (country.nutritionNeed2025 / totalNeed) * 100 : 0;
  const healthShare = totalNeed > 0 ? (country.healthNeed2025 / totalNeed) * 100 : 0;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#ffffff', color: '#0f172a' }}>
      <div style={{ position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1 }}>{country.name}</h2>
          <p style={{ margin: '6px 0 0 0', color: '#475569' }}>
            Crisis score {country.crisisScore.toFixed(2)} ({riskLabel(country.crisisScore)}) | Rank #{country.rank.toFixed(0)}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: 18, display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>Total Need (2025)</div>
            <div style={{ fontSize: 24 }}>{formatNumber(totalNeed)}</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>Absorption Capacity</div>
            <div style={{ fontSize: 24 }}>{country.absorption.toFixed(2)}</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>Total Required</div>
            <div style={{ fontSize: 20 }}>{formatCurrency(country.totalRequiredUsd)}</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>Total Funded</div>
            <div style={{ fontSize: 20 }}>{formatCurrency(country.totalFundedUsd)}</div>
          </div>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Coverage Metrics (Study)</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Food coverage</span>
                <span>{pct(country.foodCoverage)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.max(0, Math.min(100, country.foodCoverage))}%`, background: '#ea580c' }} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Health coverage</span>
                <span>{pct(country.healthCoverage)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.max(0, Math.min(100, country.healthCoverage))}%`, background: '#2563eb' }} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Nutrition coverage</span>
                <span>{pct(country.nutritionCoverage)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.max(0, Math.min(100, country.nutritionCoverage))}%`, background: '#dc2626' }} /></div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Funding Gaps</h3>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Food gap</span><strong>{formatCurrency(country.foodGapUsd)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Health gap</span><strong>{formatCurrency(country.healthGapUsd)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pooled dependency</span><strong>{country.pooledDependency.toFixed(2)}</strong></div>
          </div>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Need Composition (2025)</h3>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Food need share</span><strong>{foodShare.toFixed(1)}%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Health need share</span><strong>{healthShare.toFixed(1)}%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Nutrition need share</span><strong>{nutritionShare.toFixed(1)}%</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
