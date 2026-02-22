import { useEffect, useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine, Legend, Label
} from 'recharts';
import { ArrowLeft, TrendingDown, Activity, DollarSign, Shield, Crosshair, BarChart3 } from 'lucide-react';
import { GeminiChat } from './GeminiChat';

/* ------------------------------------------------------------------ */
/* Interfaces for Enriched Data                                       */
/* ------------------------------------------------------------------ */
interface HNOPivotCountry {
  ISO3: string;
  name: string;
  inNeed_2024_AGR: number;
  inNeed_2024_ALL: number;
  inNeed_2024_CCM: number;
  inNeed_2024_CSS: number;
  inNeed_2024_EDU: number;
  inNeed_2024_ERY: number;
  inNeed_2024_FSC: number;
  inNeed_2024_HEA: number;
  inNeed_2024_LOG: number;
  inNeed_2024_MS: number;
  inNeed_2024_NUT: number;
  inNeed_2024_PRO: number;
  inNeed_2024_SHL: number;
  inNeed_2024_WSH: number;
  targeted_2024_ALL: number;
  reached_2024_ALL: number;
  inNeed_2025_AGR: number;
  inNeed_2025_ALL: number;
  inNeed_2025_CCM: number;
  inNeed_2025_CSS: number;
  inNeed_2025_EDU: number;
  inNeed_2025_ERY: number;
  inNeed_2025_FSC: number;
  inNeed_2025_HEA: number;
  inNeed_2025_LOG: number;
  inNeed_2025_MS: number;
  inNeed_2025_NUT: number;
  inNeed_2025_PRO: number;
  inNeed_2025_SHL: number;
  inNeed_2025_WSH: number;
  targeted_2025_ALL: number;
  reached_2025_ALL: number;
  total_req_yr: number;
  total_funded_yr: number;
  health_budget_per_person: number;
  combined_social_need: number;
  neglect_index: number;
  health_to_food_need_ratio: number;
}

interface EnrichedCountry {
  ISO3: string;
  name: string;
  rank: number;
  crisis_score: number;
  absorption: number;
  health_coverage: number;
  food_coverage: number;
  health_per_person: number;
  food_per_person: number;
  effective_dollar_health: number;
  effective_dollar_food: number;
  health_need_24: number;
  food_need_24: number;
  health_change_pct: number;
  food_change_pct: number;
  food_health_lag: boolean;
  wash_health_lag: boolean;
  under5_mortality: number;
  life_expectancy: number;
  inform_risk: number;
  inform_rank: number;
  inform_risk_class: string;
  inform_vulnerability: number;
  inform_health_conditions: number;
  inform_food_security: number;
  inform_health_access: number;
  inform_conflict_intensity: number;
  doctors_per_10k: number;
  nurses_per_10k: number;
  total_workforce_per_10k: number;
  trend_inform_risk: number;
  trend_food_security: number;
  trend_health_conditions: number;
  health_misalloc: number;
  food_misalloc: number;
}

interface SectorData {
  cluster: string;
  total_in_need: number;
  total_required: number;
  total_funded: number;
  coverage: number;
  need_share: number;
  fund_share: number;
  fairness_gap: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  AFG: 'Afghanistan', BFA: 'Burkina Faso', CAF: 'Central African Rep.', COD: 'DR Congo',
  COL: 'Colombia', ETH: 'Ethiopia', GTM: 'Guatemala', HND: 'Honduras',
  HTI: 'Haiti', MLI: 'Mali', MMR: 'Myanmar', MOZ: 'Mozambique',
  NGA: 'Nigeria', SSD: 'South Sudan', TCD: 'Chad', UKR: 'Ukraine',
  SOM: 'Somalia', SLV: 'El Salvador'
};

/* ------------------------------------------------------------------ */
/* CSV Parsers                                                        */
/* ------------------------------------------------------------------ */
function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  // This regex splits by commas ONLY if they are outside of double quotes
  const csvSplitter = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

  const headers = lines[0].split(csvSplitter).map(h => h.replace(/^"|"$/g, '').trim());
  
  return lines.slice(1).map(line => {
    const vals = line.split(csvSplitter).map(v => v.replace(/^"|"$/g, '').trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? ''); });
    return row;
  });
}
function num(v: string | undefined): number {
  if (!v || v === '' || v === 'nan' || v === 'NaN') return NaN;
  const n = parseFloat(v);
  return isFinite(n) ? n : NaN;
}

function safe(v: number, fallback = 0): number {
  return isNaN(v) ? fallback : v;
}

async function loadEnrichedData(): Promise<EnrichedCountry[]> {
  const text = await fetch('/data/web_country_data.csv').then(r => r.text());
  const rows = parseCsvRows(text);
  return rows.map(r => ({
    ISO3: r.ISO3 ?? '',
    name: COUNTRY_NAMES[r.ISO3] ?? r.ISO3,
    rank: safe(num(r.rank)),
    crisis_score: safe(num(r.crisis_score)),
    absorption: safe(num(r.absorption)),
    health_coverage: safe(num(r.health_coverage)),
    food_coverage: safe(num(r.food_coverage)),
    health_per_person: safe(num(r.health_per_person)),
    food_per_person: safe(num(r.food_per_person)),
    effective_dollar_health: safe(num(r.effective_dollar_health)),
    effective_dollar_food: safe(num(r.effective_dollar_food)),
    health_need_24: safe(num(r.health_need_24)),
    food_need_24: safe(num(r.food_need_24)),
    health_change_pct: safe(num(r.health_change_pct)),
    food_change_pct: safe(num(r.food_change_pct)),
    food_health_lag: String(r.food_health_lag).trim().toLowerCase() === 'true',
    wash_health_lag: String(r.wash_health_lag).trim().toLowerCase() === 'true',
    under5_mortality: safe(num(r.under5_mortality)),
    life_expectancy: safe(num(r.life_expectancy)),
    inform_risk: safe(num(r.inform_risk)),
    inform_rank: safe(num(r.inform_rank)),
    inform_risk_class: r.inform_risk_class ?? '',
    inform_vulnerability: safe(num(r.inform_vulnerability)),
    inform_health_conditions: safe(num(r.inform_health_conditions)),
    inform_food_security: safe(num(r.inform_food_security)),
    inform_health_access: safe(num(r.inform_health_access)),
    inform_conflict_intensity: safe(num(r.inform_conflict_intensity)),
    doctors_per_10k: safe(num(r.doctors_per_10k)),
    nurses_per_10k: safe(num(r.nurses_per_10k)),
    total_workforce_per_10k: safe(num(r.total_workforce_per_10k)),
    trend_inform_risk: safe(num(r.trend_inform_risk)),
    trend_food_security: safe(num(r.trend_food_security)),
    trend_health_conditions: safe(num(r.trend_health_conditions)),
    health_misalloc: safe(num(r.health_misalloc)),
    food_misalloc: safe(num(r.food_misalloc)),
  })).filter(c => c.ISO3 && c.crisis_score > 0);
}

async function loadHNOPivot(): Promise<HNOPivotCountry[]> {
  const text = await fetch('/data/web_hno_pivot.csv').then(r => r.text());
  const rows = parseCsvRows(text);
  return rows.map(r => ({
    ISO3: r.ISO3 ?? '',
    name: COUNTRY_NAMES[r.ISO3] ?? r.ISO3,
    inNeed_2024_AGR: safe(num(r['In Need_2024_AGR'])),
    inNeed_2024_ALL: safe(num(r['In Need_2024_ALL'])),
    inNeed_2024_CCM: safe(num(r['In Need_2024_CCM'])),
    inNeed_2024_CSS: safe(num(r['In Need_2024_CSS'])),
    inNeed_2024_EDU: safe(num(r['In Need_2024_EDU'])),
    inNeed_2024_ERY: safe(num(r['In Need_2024_ERY'])),
    inNeed_2024_FSC: safe(num(r['In Need_2024_FSC'])),
    inNeed_2024_HEA: safe(num(r['In Need_2024_HEA'])),
    inNeed_2024_LOG: safe(num(r['In Need_2024_LOG'])),
    inNeed_2024_MS: safe(num(r['In Need_2024_MS'])),
    inNeed_2024_NUT: safe(num(r['In Need_2024_NUT'])),
    inNeed_2024_PRO: safe(num(r['In Need_2024_PRO'])),
    inNeed_2024_SHL: safe(num(r['In Need_2024_SHL'])),
    inNeed_2024_WSH: safe(num(r['In Need_2024_WSH'])),
    targeted_2024_ALL: safe(num(r['Targeted_2024_ALL'])),
    reached_2024_ALL: safe(num(r['Reached_2024_ALL'])),
    inNeed_2025_AGR: safe(num(r['In Need_2025_AGR'])),
    inNeed_2025_ALL: safe(num(r['In Need_2025_ALL'])),
    inNeed_2025_CCM: safe(num(r['In Need_2025_CCM'])),
    inNeed_2025_CSS: safe(num(r['In Need_2025_CSS'])),
    inNeed_2025_EDU: safe(num(r['In Need_2025_EDU'])),
    inNeed_2025_ERY: safe(num(r['In Need_2025_ERY'])),
    inNeed_2025_FSC: safe(num(r['In Need_2025_FSC'])),
    inNeed_2025_HEA: safe(num(r['In Need_2025_HEA'])),
    inNeed_2025_LOG: safe(num(r['In Need_2025_LOG'])),
    inNeed_2025_MS: safe(num(r['In Need_2025_MS'])),
    inNeed_2025_NUT: safe(num(r['In Need_2025_NUT'])),
    inNeed_2025_PRO: safe(num(r['In Need_2025_PRO'])),
    inNeed_2025_SHL: safe(num(r['In Need_2025_SHL'])),
    inNeed_2025_WSH: safe(num(r['In Need_2025_WSH'])),
    targeted_2025_ALL: safe(num(r['Targeted_2025_ALL'])),
    reached_2025_ALL: safe(num(r['Reached_2025_ALL'])),
    total_req_yr: safe(num(r.total_req_yr)),
    total_funded_yr: safe(num(r.total_funded_yr)),
    health_budget_per_person: safe(num(r.health_budget_per_person)),
    combined_social_need: safe(num(r.combined_social_need)),
    neglect_index: safe(num(r.neglect_index)),
    health_to_food_need_ratio: safe(num(r.health_to_food_need_ratio)),
  })).filter(c => c.ISO3);
}

async function loadSectorData(): Promise<SectorData[]> {
  const text = await fetch('/data/web_sector_data.csv').then(r => r.text());
  const rows = parseCsvRows(text);
  return rows.map(r => ({
    cluster: r.cluster ?? '',
    total_in_need: safe(num(r.total_in_need)),
    total_required: safe(num(r.total_required)),
    total_funded: safe(num(r.total_funded)),
    coverage: safe(num(r.coverage)),
    // Convert to percentages for readability
    need_share: safe(num(r.need_share)) * 100,
    fund_share: safe(num(r.fund_share)) * 100,
    fairness_gap: safe(num(r.fairness_gap)) * 100,
  })).filter(s => s.cluster);
}

/* ------------------------------------------------------------------ */
/* Styles & UI Components                                             */
/* ------------------------------------------------------------------ */
const CARD: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 12,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
};

const CARD_TITLE: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#f8fafc',
  margin: '0 0 4px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const CARD_SUB: React.CSSProperties = {
  fontSize: 12,
  color: '#94a3b8',
  margin: '0 0 16px 0',
  lineHeight: 1.4,
};

const COLORS = {
  amber: '#fbbf24', red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
  orange: '#f97316', purple: '#a855f7', cyan: '#06b6d4', white: '#f8fafc',
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Record<string, unknown> }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#e2e8f0', maxWidth: 220, zIndex: 1000 }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: COLORS.amber }}>{String(d.name || d.cluster || d.ISO3 || '')}</div>
      {Object.entries(d).filter(([k]) => !['name', 'ISO3', 'cluster', 'fill', 'z', 'lag'].includes(k)).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ color: '#94a3b8' }}>{k}</span>
          <span>{typeof v === 'number' ? v.toFixed(2) : String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color ?? COLORS.white }}>{value}</div>
    </div>
  );
}

/* ================================================================== */
/* MAIN COMPONENT                                                     */
/* ================================================================== */
interface AnalyticsDashboardProps {
  onBack: () => void;
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [data, setData] = useState<EnrichedCountry[]>([]);
  const [hnoData, setHNOData] = useState<HNOPivotCountry[]>([]);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadEnrichedData(), loadHNOPivot(), loadSectorData()])
      .then(([enriched, hno, sector]) => {
        setData(enriched);
        setHNOData(hno);
        setSectorData(sector);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---- Datasets ---- */
  const scatterInform = useMemo(() =>
    data.filter(d => d.inform_risk > 0).map(d => ({
      name: d.name, ISO3: d.ISO3,
      'INFORM Risk': d.inform_risk,
      'Crisis Score': d.crisis_score,
      'Health Need': d.health_need_24,
      z: Math.sqrt(d.health_need_24) / 300,
      fill: d.crisis_score > 0.5 ? COLORS.red : d.crisis_score > 0.35 ? COLORS.orange : COLORS.blue,
    })), [data]);

  const quadrantData = useMemo(() =>
    data.filter(d => d.absorption > 0).map(d => ({
      name: d.name, ISO3: d.ISO3,
      'Absorption': d.absorption,
      'Health Coverage %': d.health_coverage * 100,
      'Crisis Score': d.crisis_score,
      fill: d.crisis_score > 0.5 ? COLORS.red : d.crisis_score > 0.35 ? COLORS.orange : COLORS.green,
    })), [data]);

  const lagData = useMemo(() =>
    data.filter(d => !isNaN(d.food_change_pct) && !isNaN(d.health_change_pct)).map(d => ({
      name: d.name, ISO3: d.ISO3,
      'Food Δ%': d.food_change_pct,
      'Health Δ%': d.health_change_pct,
      lag: d.food_health_lag,
      fill: d.food_health_lag ? COLORS.red : COLORS.blue,
    })), [data]);

  const conflictData = useMemo(() =>
    data.filter(d => d.inform_conflict_intensity > 0)
      .sort((a, b) => b.inform_conflict_intensity - a.inform_conflict_intensity)
      .map(d => ({
        name: d.ISO3,
        'Conflict': d.inform_conflict_intensity,
        'Crisis Score': d.crisis_score,
        fill: d.inform_conflict_intensity > 7 ? COLORS.red : d.inform_conflict_intensity > 5 ? COLORS.orange : COLORS.amber,
      })), [data]);

const coverageDataScatter = useMemo(() =>
    data.filter(d => d.health_coverage > 0 && d.food_coverage > 0)
      .map(d => ({
        name: d.name, ISO3: d.ISO3,
        'Food Coverage %': +(d.food_coverage * 100).toFixed(1),
        'Health Coverage %': +(d.health_coverage * 100).toFixed(1),
        fill: (d.health_coverage < d.food_coverage) ? COLORS.orange : COLORS.green,
      })), [data]);

  const sectorNeeds2024 = useMemo(() =>
    hnoData.filter(d => d.inNeed_2024_ALL > 0).map(d => ({
      name: d.name,
      'Health': d.inNeed_2024_HEA,
      'Food': d.inNeed_2024_FSC,
      'WASH': d.inNeed_2024_WSH,
      'Nutrition': d.inNeed_2024_NUT,
      'Agriculture': d.inNeed_2024_AGR,
      'Total': d.inNeed_2024_ALL,
    })), [hnoData]);

  const sectorNeeds2025 = useMemo(() =>
    hnoData.filter(d => d.inNeed_2025_ALL > 0).map(d => ({
      name: d.name,
      'Health': d.inNeed_2025_HEA,
      'Food': d.inNeed_2025_FSC,
      'WASH': d.inNeed_2025_WSH,
      'Nutrition': d.inNeed_2025_NUT,
      'Agriculture': d.inNeed_2025_AGR,
      'Total': d.inNeed_2025_ALL,
    })), [hnoData]);

  const coverageRates2024 = useMemo(() =>
    hnoData.filter(d => d.targeted_2024_ALL > 0).map(d => ({
      name: d.name,
      'Coverage %': +(d.reached_2024_ALL / d.targeted_2024_ALL * 100).toFixed(1),
    })), [hnoData]);

  const coverageRates2025 = useMemo(() =>
    hnoData.filter(d => d.targeted_2025_ALL > 0).map(d => ({
      name: d.name,
      'Coverage %': +(d.reached_2025_ALL / d.targeted_2025_ALL * 100).toFixed(1),
    })), [hnoData]);

  const fundingEfficiency = useMemo(() =>
    hnoData.filter(d => d.total_funded_yr > 0).map(d => ({
      name: d.name,
      'Funded %': +(d.total_funded_yr / d.total_req_yr * 100).toFixed(1),
    })), [hnoData]);

  /* ---- Stats ---- */
  const pearsonR = useMemo(() => {
    const valid = data.filter(d => d.inform_risk >= 0 && d.crisis_score > 0);
    if (valid.length < 4) return NaN;
    const xs = valid.map(d => d.crisis_score);
    const ys = valid.map(d => d.inform_risk);
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) {
      const xi = xs[i] - mx, yi = ys[i] - my;
      num += xi * yi; dx += xi * xi; dy += yi * yi;
    }
    return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : NaN;
  }, [data]);

  const healthWorseCount = useMemo(() => data.filter(d => d.health_coverage < d.food_coverage).length, [data]);
  const lagCount = useMemo(() => data.filter(d => d.food_health_lag).length, [data]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#fff', gap: 10 }}>
        <Activity size={20} className="animate-spin" />
        <span>Loading analytics…</span>
      </div>
    );
  }

  return (
    <div style={{ background: '#020617', color: '#f8fafc', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f172aee', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: 'none', border: '1px solid #334155', borderRadius: 8, color: '#cbd5e1', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <ArrowLeft size={14} /> Map
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
                <BarChart3 size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: COLORS.amber }} />
                Analytics Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                {data.length} countries · 30+ data sources · INFORM + WHO + OCHA
              </p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px 60px' }}>
        {/* ── Stat row ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <Stat label="Our Score vs INFORM" value={`r = ${isNaN(pearsonR) ? '—' : pearsonR.toFixed(3)}`} color={COLORS.amber} />
          <Stat label="Health more neglected" value={`${healthWorseCount}/${data.length}`} color={COLORS.red} />
          <Stat label="Food→Health lag" value={`${lagCount} countries`} color={COLORS.orange} />
          <Stat label="Countries scored" value={`${data.length}`} />
        </div>

        {/* ── Chart grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))', gap: 16 }}>

          {/* 1 ─ Crisis Score vs INFORM Risk */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><Crosshair size={15} color={COLORS.amber} /> Our Score vs INFORM Risk</h3>
            <p style={CARD_SUB}>r = {isNaN(pearsonR) ? '—' : pearsonR.toFixed(3)} — Low correlation highlights crises standard metrics miss.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="INFORM Risk" type="number" stroke="#64748b" fontSize={11} domain={[0, 10]}>
                    <Label value="INFORM Risk Score (0-10)" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="Crisis Score" type="number" stroke="#64748b" fontSize={11} domain={[0, 0.75]}>
                    <Label value="Our Crisis Score" angle={-90} position="insideLeft" offset={10} fill="#94a3b8" fontSize={11} />
                  </YAxis>
                  <Tooltip content={<ChartTooltip />} />
                  <Scatter data={scatterInform} shape="circle">
                    {scatterInform.map((d, i) => (
                      <Cell key={i} fill={d.fill} r={Math.max(5, Math.min(18, d.z))} fillOpacity={0.8} stroke={d.fill} strokeWidth={1} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2 ─ Absorption–Coverage Quadrant */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><Shield size={15} color={COLORS.green} /> Absorption vs Health Coverage</h3>
            <p style={CARD_SUB}>Low absorption + low coverage = invisible crisis. High absorption + low coverage = wasted potential.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="Absorption" type="number" stroke="#64748b" fontSize={11} domain={[0, 1]}>
                    <Label value="Absorption Capacity" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="Health Coverage %" type="number" stroke="#64748b" fontSize={11}>
                    <Label value="Health Coverage %" angle={-90} position="insideLeft" offset={10} fill="#94a3b8" fontSize={11} />
                  </YAxis>
                  <Tooltip content={<ChartTooltip />} />
                  <Scatter data={quadrantData} shape="circle">
                    {quadrantData.map((d, i) => (
                      <Cell key={i} fill={d.fill} r={8} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 ─ Food→Health Lag Signal */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><TrendingDown size={15} color={COLORS.red} /> Food → Health Lag Signal</h3>
            <p style={CARD_SUB}>Red dots = food needs dropped but health needs spiked.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="Food Δ%" type="number" stroke="#64748b" fontSize={11}>
                    <Label value="Food Need Change %" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="Health Δ%" type="number" stroke="#64748b" fontSize={11}>
                    <Label value="Health Need Change %" angle={-90} position="insideLeft" offset={10} fill="#94a3b8" fontSize={11} />
                  </YAxis>
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine x={0} stroke="#334155" />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Scatter data={lagData} shape="circle">
                    {lagData.map((d, i) => (
                      <Cell key={i} fill={d.fill} r={8} fillOpacity={0.85} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 ─ Conflict Intensity */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><Activity size={15} color={COLORS.orange} /> Conflict as Root Cause</h3>
            <p style={CARD_SUB}>INFORM conflict intensity mapped against our crisis score.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conflictData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 10]}>
                    <Label value="INFORM Conflict Intensity" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Conflict" radius={[0, 4, 4, 0]}>
                    {conflictData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>


          {/* 6 ─ Health vs Food Coverage (Neglect Scatter) */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><DollarSign size={15} color={COLORS.cyan} /> Systematic Neglect</h3>
            <p style={CARD_SUB}>Dots below the diagonal line mean health is more underfunded than food.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="Food Coverage %" type="number" stroke="#64748b" fontSize={11} domain={[0, 100]}>
                    <Label value="Food Coverage %" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="Health Coverage %" type="number" stroke="#64748b" fontSize={11} domain={[0, 100]}>
                    <Label value="Health Coverage %" angle={-90} position="insideLeft" offset={10} fill="#94a3b8" fontSize={11} />
                  </YAxis>
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Scatter data={coverageDataScatter} shape="circle">
                    {coverageDataScatter.map((d, i) => (
                      <Cell key={i} fill={d.fill} r={7} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7 ─ Sector Needs 2024 */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><Activity size={15} color={COLORS.purple} /> Multi-Sector Needs 2024</h3>
            <p style={CARD_SUB}>Scale of people in need across core sectors.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sectorNeeds2024} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11}>
                    <Label value="People in Need" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="Health" fill={COLORS.blue} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Food" fill={COLORS.orange} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="WASH" fill={COLORS.cyan} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Nutrition" fill={COLORS.green} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Agriculture" fill={COLORS.amber} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Total" fill={COLORS.red} radius={[0, 2, 2, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 8 ─ Sector Needs 2025 */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><Activity size={15} color={COLORS.purple} /> Multi-Sector Needs 2025</h3>
            <p style={CARD_SUB}>Year-over-year comparison of evolving needs.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sectorNeeds2025} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11}>
                    <Label value="People in Need" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="Health" fill={COLORS.blue} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Food" fill={COLORS.orange} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="WASH" fill={COLORS.cyan} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Nutrition" fill={COLORS.green} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Agriculture" fill={COLORS.amber} radius={[0, 2, 2, 0]} barSize={8} />
                  <Bar dataKey="Total" fill={COLORS.red} radius={[0, 2, 2, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 9 ─ Coverage Rates 2024 */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><DollarSign size={15} color={COLORS.cyan} /> Coverage Rates 2024</h3>
            <p style={CARD_SUB}>Percentage of targeted population that was actually reached.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={coverageRates2024} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]}>
                    <Label value="Coverage Rate" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="Coverage %" fill={COLORS.blue} radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 10 ─ Coverage Rates 2025 */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><DollarSign size={15} color={COLORS.cyan} /> Coverage Rates 2025</h3>
            <p style={CARD_SUB}>Percentage of targeted population that was actually reached.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={coverageRates2025} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]}>
                    <Label value="Coverage Rate" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="Coverage %" fill={COLORS.blue} radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 11 ─ Funding Efficiency */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><DollarSign size={15} color={COLORS.cyan} /> Overall Funding Efficiency</h3>
            <p style={CARD_SUB}>Percentage of required funding actually received per country.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fundingEfficiency.sort((a, b) => b['Funded %'] - a['Funded %'])} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]}>
                    <Label value="Funding Efficiency" position="bottom" offset={10} fill="#94a3b8" fontSize={11} />
                  </XAxis>
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine x={50} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Bar dataKey="Funded %" radius={[0, 4, 4, 0]} barSize={12}>
                    {fundingEfficiency.map((d, i) => (
                      <Cell key={i} fill={d['Funded %'] > 50 ? COLORS.green : COLORS.red} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12 ─ Global Sector Fairness Gap */}
          <div style={CARD}>
            <h3 style={CARD_TITLE}><Activity size={15} color={COLORS.red} /> Structural Bias: Need vs Funding</h3>
            <p style={CARD_SUB}>Global median share of people in need vs share of funding received.</p>
            <div style={{ width: '100%', height: 400, minHeight: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sectorData.sort((a, b) => a.fairness_gap - b.fairness_gap)} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" />
                  <YAxis dataKey="cluster" type="category" stroke="#64748b" fontSize={11} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="need_share" name="Share of Global Need %" fill={COLORS.red} radius={[0, 4, 4, 0]} barSize={10} />
                  <Bar dataKey="fund_share" name="Share of Global Funding %" fill={COLORS.green} radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
      
      {/* AI Chat Assistant */}
      <GeminiChat 
        crisisData={data} 
        selectedCountry={undefined} 
        currentChart="Analytics Dashboard" 
      />
    </div>
  );
}