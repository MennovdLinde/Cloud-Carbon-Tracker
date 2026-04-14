import { SummaryData } from '../types';

interface Props {
  totals: SummaryData['totals'];
  regionCount: number;
}

export default function StatRow({ totals, regionCount }: Props) {
  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="label">Monthly Cloud Cost</div>
        <div className="value">
          ${totals.monthlyCostUsd.toLocaleString()}
          <span className="unit">/ mo</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="label">Total CO₂ Emitted</div>
        <div className="value">
          {totals.co2Kg.toLocaleString()}
          <span className="unit">kg / mo</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="label">Energy Consumed</div>
        <div className="value">
          {totals.totalKwh.toLocaleString()}
          <span className="unit">kWh / mo</span>
        </div>
      </div>

      <div className="stat-card highlight">
        <div className="label">CO₂ in Tonnes</div>
        <div className="value">
          {totals.co2Tonnes.toFixed(3)}
          <span className="unit">t CO₂</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="label">Active Regions</div>
        <div className="value">{regionCount}</div>
      </div>
    </div>
  );
}
