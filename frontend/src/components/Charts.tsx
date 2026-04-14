import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RegionResult } from '../types';

interface Props {
  regions: RegionResult[];
}

const COLORS = ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

const tooltipStyle = {
  backgroundColor: '#1a1d27',
  border: '1px solid #2e3347',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
};

export default function Charts({ regions }: Props) {
  const co2Data = [...regions]
    .sort((a, b) => b.co2Kg - a.co2Kg)
    .map((r) => ({
      name: r.regionId,
      co2: r.co2Kg,
      cost: r.monthlyCostUsd,
    }));

  const costData = regions.map((r) => ({
    name: r.regionId,
    value: r.monthlyCostUsd,
  }));

  return (
    <div className="chart-row">
      {/* CO2 bar chart */}
      <div className="chart-card">
        <h3>CO₂ per Region (kg/mo)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={co2Data} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v} kg`, 'CO₂']}
            />
            <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
              {co2Data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost pie chart */}
      <div className="chart-card">
        <h3>Cost Distribution (USD/mo)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={costData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {costData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`$${v}`, 'Cost']}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
