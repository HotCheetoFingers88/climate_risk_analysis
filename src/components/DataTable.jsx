export default function DataTable({ years, temperatures, precipitations, actualRisk, predictedRisk, anomalies }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Temp (°C)</th>
            <th>Precip (mm)</th>
            <th>Actual Risk</th>
            <th>Predicted Risk</th>
            <th>Δ Error</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {years.map((yr, i) => {
            const err = (actualRisk[i] - predictedRisk[i]).toFixed(3);
            return (
              <tr key={yr} className={anomalies[i] ? 'anomaly' : ''}>
                <td>{yr}</td>
                <td>{temperatures[i]}</td>
                <td>{precipitations[i]}</td>
                <td>{actualRisk[i]}</td>
                <td>{predictedRisk[i]}</td>
                <td>{err}</td>
                <td>{anomalies[i] ? '⚠ anomaly' : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
