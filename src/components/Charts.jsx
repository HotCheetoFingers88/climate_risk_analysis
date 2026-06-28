import { Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const baseOptions = (yLabel, xLabel) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { boxWidth: 12, font: { size: 11 } } },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { title: { display: !!xLabel, text: xLabel, color: '#6b7fa3' }, grid: { color: 'rgba(0,0,0,0.06)' } },
    y: { title: { display: true, text: yLabel, color: '#6b7fa3' }, grid: { color: 'rgba(0,0,0,0.06)' } },
  },
});

export function TimelineChart({ years, actualRisk, predictedRisk, anomalies }) {
  const anomalyColors = actualRisk.map((_, i) => (anomalies[i] ? 'rgba(181,74,63,1)' : 'rgba(107,122,46,0.9)'));
  const data = {
    labels: years,
    datasets: [
      {
        label: 'Actual Risk',
        data: actualRisk,
        borderColor: 'rgba(107,122,46,0.9)',
        backgroundColor: 'rgba(107,122,46,0.08)',
        pointBackgroundColor: anomalyColors,
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Predicted Risk',
        data: predictedRisk,
        borderColor: 'rgba(139,105,20,0.9)',
        borderDash: [5, 4],
        pointRadius: 3,
        tension: 0.3,
        fill: false,
      },
    ],
  };
  return (
    <div className="chart-wrap">
      <Line data={data} options={baseOptions('Risk Score')} />
    </div>
  );
}

export function ScatterChart({ xValues, actualRisk, predictedRisk, anomalies, xLabel }) {
  const colors = anomalies.map((a) => (a ? 'rgba(181,74,63,0.85)' : 'rgba(107,122,46,0.7)'));
  const data = {
    datasets: [
      {
        label: 'Actual',
        data: xValues.map((x, i) => ({ x, y: actualRisk[i] })),
        backgroundColor: colors,
        pointRadius: 6,
      },
      {
        label: 'Predicted',
        data: xValues.map((x, i) => ({ x, y: predictedRisk[i] })),
        backgroundColor: 'rgba(139,105,20,0.5)',
        pointRadius: 4,
      },
    ],
  };
  return (
    <div className="chart-wrap">
      <Scatter data={data} options={baseOptions('Risk Score', xLabel)} />
    </div>
  );
}
