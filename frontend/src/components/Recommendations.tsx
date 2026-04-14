interface Props {
  recommendations: string[];
}

export default function Recommendations({ recommendations }: Props) {
  if (recommendations.length === 0) return null;

  return (
    <div className="recs-section">
      <div className="section-title">Optimization Recommendations</div>
      <ul className="rec-list">
        {recommendations.map((rec, i) => (
          <li key={i} className="rec-item">
            <div className="rec-icon">✓</div>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
