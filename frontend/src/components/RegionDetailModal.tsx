import { useEffect, useState } from 'react';
import { RegionResult } from '../types';

interface Props {
  regionId: string;
  onClose: () => void;
}

const BASE = import.meta.env.VITE_API_URL ?? 'https://cloud-carbon-tracker-api-b1b7f289ecff.herokuapp.com';

export default function RegionDetailModal({ regionId, onClose }: Props) {
  const [data, setData] = useState<RegionResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/carbon/region/${regionId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [regionId]);

  // Close on backdrop click or Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {!data && !error && (
          <div className="centered"><div className="spinner" /></div>
        )}

        {error && (
          <div style={{ color: '#f87171' }}>Failed to load region detail.</div>
        )}

        {data && (
          <>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{data.regionName}</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{data.location}</div>
              </div>
              <span className="provider-badge">{data.provider}</span>
            </div>

            <div className="modal-grid">
              <div className="modal-stat">
                <div className="m-label">CO₂ / month</div>
                <div className="m-value">{data.co2Kg.toFixed(1)} kg</div>
                <div className="m-label" style={{ marginTop: 2 }}>{data.co2Tonnes.toFixed(3)} tonnes</div>
              </div>
              <div className="modal-stat">
                <div className="m-label">Monthly cost</div>
                <div className="m-value">${data.monthlyCostUsd}</div>
              </div>
              <div className="modal-stat">
                <div className="m-label">Total energy</div>
                <div className="m-value">{data.totalKwh} kWh</div>
                <div className="m-label" style={{ marginTop: 2 }}>compute: {data.computeKwh} kWh</div>
              </div>
              <div className="modal-stat">
                <div className="m-label">Cost efficiency</div>
                <div className="m-value">${data.costPerKgCo2}</div>
                <div className="m-label" style={{ marginTop: 2 }}>per kg CO₂</div>
              </div>
              <div className="modal-stat">
                <div className="m-label">Carbon intensity</div>
                <div className={`m-value rating-${data.rating}`}>{data.carbonIntensity} gCO₂/kWh</div>
              </div>
              <div className="modal-stat">
                <div className="m-label">Renewable energy</div>
                <div className="m-value">{data.renewablePercent}%</div>
              </div>
            </div>

            {data.instanceTypes.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="m-label" style={{ marginBottom: 6 }}>Instance types</div>
                <div className="instance-list">
                  {data.instanceTypes.map((t, i) => (
                    <span key={i} className="instance-chip">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {data.alerts.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="m-label" style={{ marginBottom: 6 }}>Alerts</div>
                {data.alerts.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#fcd34d', marginBottom: 4 }}>⚠ {a}</div>
                ))}
              </div>
            )}

            {data.recommendations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="m-label" style={{ marginBottom: 6 }}>Recommendations</div>
                {data.recommendations.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>→ {r}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
