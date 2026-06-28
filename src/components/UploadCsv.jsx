import { useState } from 'react';
import StatsGrid from './StatsGrid';
import ModelCard from './ModelCard';
import DataTable from './DataTable';
import { TimelineChart, ScatterChart } from './Charts';

export default function UploadCsv() {
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function postAnalyze(opts) {
    setLoading(true);
    setError(null);
    fetch('/api/analyze', opts)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then((body) => setResult(body))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function handleFile(file) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      postAnalyze({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: e.target.result }),
      });
    };
    reader.readAsText(file);
  }

  function runSample() {
    setFileName('sample_data.csv');
    postAnalyze({ method: 'GET' });
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-label">Bring your own data</div>
        <div className="card-desc">
          Upload a CSV with Year, Temperature, Precipitation, RiskScore columns — or run the built-in
          synthetic example to see the tool work without real data.
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
          <button type="button" className="btn-primary" onClick={runSample} disabled={loading}>
            ▶ Run Sample Data
          </button>
          {fileName && <span style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{fileName}</span>}
        </div>
      </div>

      {loading && <div className="status-banner loading"><span className="spinner" />Running analysis…</div>}
      {error && <div className="status-banner error">⚠ {error}</div>}

      {result && (
        <>
          <StatsGrid stats={result.stats} />
          <ModelCard stats={result.stats} />
          <div className="charts-grid">
            <div className="chart-card wide">
              <div className="chart-title">Risk Score Over Time</div>
              <TimelineChart
                years={result.years}
                actualRisk={result.actual_risk}
                predictedRisk={result.predicted_risk}
                anomalies={result.anomalies}
              />
            </div>
            <div className="chart-card">
              <div className="chart-title">Temperature vs Risk Score</div>
              <ScatterChart
                xValues={result.temperatures}
                actualRisk={result.actual_risk}
                predictedRisk={result.predicted_risk}
                anomalies={result.anomalies}
                xLabel="Temperature (°C)"
              />
            </div>
            <div className="chart-card">
              <div className="chart-title">Precipitation vs Risk Score</div>
              <ScatterChart
                xValues={result.precipitations}
                actualRisk={result.actual_risk}
                predictedRisk={result.predicted_risk}
                anomalies={result.anomalies}
                xLabel="Precipitation (mm)"
              />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Full Data Table</div>
            <DataTable
              years={result.years}
              temperatures={result.temperatures}
              precipitations={result.precipitations}
              actualRisk={result.actual_risk}
              predictedRisk={result.predicted_risk}
              anomalies={result.anomalies}
            />
          </div>
        </>
      )}
    </div>
  );
}
