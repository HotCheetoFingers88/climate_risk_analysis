import { useEffect, useMemo, useState } from 'react';
import CityPicker from './CityPicker';
import WeightControls from './WeightControls';
import StatsGrid from './StatsGrid';
import ModelCard from './ModelCard';
import DataTable from './DataTable';
import { TimelineChart, ScatterChart } from './Charts';
import { useCities, useClimateData } from '../hooks/useClimateData';
import { useAnalysis } from '../hooks/useAnalysis';
import { computeRiskScores, DEFAULT_WEIGHTS } from '../lib/riskScore';

const START_YEAR = 1995;
const END_YEAR = 2024;

export default function Analyze() {
  const { cities, loading: citiesLoading, error: citiesError } = useCities();
  const [selectedCity, setSelectedCity] = useState(null);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  useEffect(() => {
    if (!selectedCity && cities.length > 0) setSelectedCity(cities[0].id);
  }, [cities, selectedCity]);

  const { data: climate, loading: climateLoading, error: climateError } = useClimateData(
    selectedCity,
    START_YEAR,
    END_YEAR
  );

  const { result, loading: analysisLoading, error: analysisError, runAnalysis } = useAnalysis();

  const riskScores = useMemo(() => {
    if (!climate) return null;
    return computeRiskScores(climate.temperatures, climate.precipitations, weights);
  }, [climate, weights]);

  useEffect(() => {
    if (climate && riskScores) {
      runAnalysis(climate.years, climate.temperatures, climate.precipitations, riskScores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [climate, riskScores]);

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-label">1. Pick a city</div>
        <CityPicker
          cities={cities}
          selectedId={selectedCity}
          onSelect={setSelectedCity}
          loading={citiesLoading}
          error={citiesError}
        />

        <div className="section-label">2. Define what "risk" means to you</div>
        <WeightControls weights={weights} onChange={setWeights} />
      </div>

      {climateLoading && (
        <div className="status-banner loading">
          <span className="spinner" />
          Fetching {START_YEAR}–{END_YEAR} climate data from NOAA…
        </div>
      )}

      {climateError && (
        <div className="status-banner error">⚠ {climateError}</div>
      )}

      {climate && climate.years_skipped?.length > 0 && (
        <div className="status-banner info">
          ℹ Skipped {climate.years_skipped.length} year(s) with incomplete NOAA records for{' '}
          {climate.city.label} ({climate.years_returned} of {climate.years_requested} years used)
          — real station data has gaps; we drop incomplete years rather than guess.
        </div>
      )}

      {analysisError && <div className="status-banner error">⚠ {analysisError}</div>}

      {analysisLoading && !result && (
        <div className="status-banner loading"><span className="spinner" />Running regression…</div>
      )}

      {result && (
        <>
          <StatsGrid stats={result.stats} />
          <ModelCard stats={result.stats} />

          <div className="charts-grid">
            <div className="chart-card wide">
              <div className="chart-title">Risk Score Over Time — Actual vs Predicted</div>
              <div className="chart-desc">
                Solid line = computed risk from real temp/precip. Dashed = what the regression predicts.
                Red dots = anomalous years (&gt;2σ from mean).
              </div>
              <TimelineChart
                years={result.years}
                actualRisk={result.actual_risk}
                predictedRisk={result.predicted_risk}
                anomalies={result.anomalies}
              />
            </div>
            <div className="chart-card">
              <div className="chart-title">Temperature vs Risk Score</div>
              <div className="chart-desc">Each dot is one year of real NOAA data.</div>
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
              <div className="chart-desc">Each dot is one year of real NOAA data.</div>
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
            <div className="chart-title">
              Full Data Table{' '}
              <span style={{ color: 'var(--accent2)', fontSize: '0.72rem', marginLeft: '0.5rem' }}>
                🔴 highlighted rows = anomalies
              </span>
            </div>
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
