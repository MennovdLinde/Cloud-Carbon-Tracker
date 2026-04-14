interface Props {
  alerts: string[];
}

export default function AlertBanner({ alerts }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="alert-section">
      <div className="section-title">Active Alerts</div>
      {alerts.map((alert, i) => (
        <div key={i} className="alert-banner">
          <span className="alert-icon">⚠</span>
          {alert}
        </div>
      ))}
    </div>
  );
}
