import { RegionResult } from '../types';

interface Props {
  region: RegionResult;
}

// Max intensity on scale (used for bar width %)
const MAX_INTENSITY = 600;

function co2ColorClass(kg: number): string {
  if (kg < 50) return 'co2-green';
  if (kg < 150) return 'co2-yellow';
  return 'co2-red';
}

export default function RegionCard({ region }: Props) {
  const barWidth = Math.min((region.carbonIntensity / MAX_INTENSITY) * 100, 100);

  const renewableClass =
    region.renewablePercent >= 60 ? 'green' :
    region.renewablePercent >= 30 ? 'yellow' : 'red';

  return (
    <div className={`region-card ${region.rating}`}>
      {/* Header */}
      <div className="region-header">
        <div>
          <div className="region-name">{region.regionName}</div>
          <div className="region-location">{region.location}</div>
        </div>
        <span className="provider-badge">{region.provider}</span>
      </div>

      {/* Key metrics */}
      <div className="region-metrics">
        <div className="metric">
          <span className="m-label">CO₂ / month</span>
          <span className={`m-value ${co2ColorClass(region.co2Kg)}`}>
            {region.co2Kg.toFixed(1)} <small style={{ fontSize: 13 }}>kg</small>
          </span>
        </div>
        <div className="metric">
          <span className="m-label">Monthly cost</span>
          <span className="m-value">${region.monthlyCostUsd}</span>
        </div>
        <div className="metric">
          <span className="m-label">Energy used</span>
          <span className="m-value">{region.totalKwh} <small style={{ fontSize: 13 }}>kWh</small></span>
        </div>
        <div className="metric">
          <span className="m-label">Renewable</span>
          <span className={`renewable-tag ${renewableClass}`}>
            {region.renewablePercent}%
          </span>
        </div>
      </div>

      {/* Carbon intensity bar */}
      <div className="intensity-bar-wrap">
        <div className="intensity-bar-label">
          <span>Carbon intensity</span>
          <span>{region.carbonIntensity} gCO₂/kWh</span>
        </div>
        <div className="intensity-bar-track">
          <div
            className={`intensity-bar-fill ${region.rating}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Instance types */}
      {region.instanceTypes.length > 0 && (
        <div>
          <div className="m-label" style={{ marginBottom: 6 }}>Instances</div>
          <div className="instance-list">
            {region.instanceTypes.map((t, i) => (
              <span key={i} className="instance-chip">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Region-level alerts */}
      {region.alerts.length > 0 && (
        <div style={{ fontSize: 12, color: '#fcd34d', lineHeight: 1.5 }}>
          {region.alerts.map((a, i) => (
            <div key={i}>⚠ {a}</div>
          ))}
        </div>
      )}
    </div>
  );
}
