export default function ModelCard({ stats }) {
  if (!stats) return null;
  const sign = (v) => (v >= 0 ? '+' : '−');
  const absB1 = Math.abs(stats.b1_temp);
  const absB2 = Math.abs(stats.b2_precip);

  return (
    <div className="model-card">
      <div className="model-title">Regression Equation</div>
      <div className="equation">
        RiskScore = {stats.b0} {sign(stats.b1_temp)} {absB1} × Temperature {sign(stats.b2_precip)} {absB2} × Precipitation
      </div>
      <div className="model-explain">
        Each extra <strong>1°C</strong> of temperature is associated with a risk change of{' '}
        <strong style={{ color: 'var(--accent)' }}>
          {stats.b1_temp > 0 ? '+' : ''}{stats.b1_temp}
        </strong>{' '}
        points. Each extra <strong>1mm</strong> of precipitation is associated with a change of{' '}
        <strong style={{ color: 'var(--accent)' }}>
          {stats.b2_precip > 0 ? '+' : ''}{stats.b2_precip}
        </strong>{' '}
        points. The model explains{' '}
        <strong style={{ color: 'var(--accent)' }}>{(stats.r2 * 100).toFixed(1)}%</strong> of the variation in RiskScore.
      </div>
      <div className="corr-row">
        <div>Temp ↔ Risk correlation: <strong>{stats.temp_risk_corr}</strong></div>
        <div>Precip ↔ Risk correlation: <strong>{stats.precip_risk_corr}</strong></div>
      </div>
    </div>
  );
}
