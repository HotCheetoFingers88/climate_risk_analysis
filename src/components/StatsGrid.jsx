export default function StatsGrid({ stats }) {
  if (!stats) return null;
  const r2class = stats.r2 >= 0.85 ? '' : stats.r2 >= 0.6 ? 'warn' : 'danger';
  const r2label = stats.r2 >= 0.85 ? '✓ Strong fit' : stats.r2 >= 0.6 ? '~ Moderate fit' : '✗ Weak fit';

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Data Points</div>
        <div className="stat-value">{stats.n}</div>
        <div className="stat-sub">{stats.n_anomalies} anomalies found</div>
        <div className="stat-hint">Number of complete years used in the model.</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Mean Risk</div>
        <div className="stat-value">{stats.mean}</div>
        <div className="stat-sub">σ = {stats.std}</div>
        <div className="stat-hint">Average RiskScore across all years. σ shows how much it varies.</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Median Risk</div>
        <div className="stat-value">{stats.median}</div>
        <div className="stat-sub">Middle value</div>
        <div className="stat-hint">Half of years fall above this, half below.</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">R² Score</div>
        <div className={`stat-value ${r2class}`}>{stats.r2}</div>
        <div className="stat-sub">{r2label}</div>
        <div className="stat-hint">How much of the risk variation Temp + Precip explain.</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">MSE</div>
        <div className="stat-value">{stats.mse}</div>
        <div className="stat-sub">Mean Squared Error</div>
        <div className="stat-hint">Average squared prediction error. Lower is better.</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Anomalies</div>
        <div className={`stat-value ${stats.n_anomalies > 0 ? 'danger' : ''}`}>{stats.n_anomalies}</div>
        <div className="stat-sub">Beyond 2σ from mean</div>
        <div className="stat-hint">Years with unusually high or low risk.</div>
      </div>
    </div>
  );
}
