import { useEffect, useState } from 'react';
import { SummaryData } from './types';
import StatRow from './components/StatRow';
import AlertBanner from './components/AlertBanner';
import RegionCard from './components/RegionCard';
import Recommendations from './components/Recommendations';
import Charts from './components/Charts';

const BASE = import.meta.env.VITE_API_URL ?? 'https://cloud-carbon-tracker-api-b1b7f289ecff.herokuapp.com';
const API = `${BASE}/api/carbon/summary`;

export default function App() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function fetchData() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SummaryData = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError('Could not reach backend. Make sure the backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="centered">
        <div className="spinner" />
        Loading cloud carbon data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="centered" style={{ flexDirection: 'column', gap: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 32 }}>⚠</div>
        <div style={{ color: '#ef4444', fontWeight: 600 }}>Backend not reachable</div>
        <div style={{ maxWidth: 420, color: '#94a3b8' }}>{error}</div>
        <button
          onClick={fetchData}
          style={{
            marginTop: 8,
            padding: '8px 20px',
            background: '#22c55e',
            color: '#000',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const sorted = [...data.regions].sort((a, b) => b.co2Kg - a.co2Kg);

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <div>
            <h1>☁ Cloud Carbon Tracker</h1>
            <div className="subtitle">
              Real-time cloud cost + CO₂ dashboard · {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge-mock">
            {data.dataSource === 'mock' ? 'Mock data · add AWS/GCP keys for live data' : `Live · ${data.dataSource.toUpperCase()}`}
          </span>
          <button
            onClick={fetchData}
            style={{
              padding: '6px 14px',
              background: '#22263a',
              color: '#e2e8f0',
              border: '1px solid #2e3347',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Totals */}
      <StatRow totals={data.totals} regionCount={data.regions.length} />

      {/* Greenest alternative tip */}
      {data.greenestAlternative && (
        <div className="green-tip">
          <span className="tip-icon">🌿</span>
          <span>
            <strong>Greenest available region:</strong> {data.greenestAlternative.name} —{' '}
            {data.greenestAlternative.carbonIntensity} gCO₂/kWh with{' '}
            {data.greenestAlternative.renewablePercent}% renewables. Consider migrating
            low-latency-tolerant workloads here.
          </span>
        </div>
      )}

      {/* Alerts */}
      <AlertBanner alerts={data.alerts} />

      {/* Charts */}
      <Charts regions={data.regions} />

      {/* Region cards */}
      <div className="section-title">Regions ({sorted.length})</div>
      <div className="region-grid">
        {sorted.map((r) => (
          <RegionCard key={r.regionId} region={r} />
        ))}
      </div>

      {/* Recommendations */}
      <Recommendations recommendations={data.recommendations} />

      <div className="footer">
        Carbon intensity data: AWS Carbon Footprint Tool, Electricity Maps, IEA 2024 ·
        Built with TypeScript + React · <a href="https://github.com/MennovdLinde" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </div>
  );
}
