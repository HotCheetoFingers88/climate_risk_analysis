export default function Glossary() {
  return (
    <div>
      <div className="gloss-section">
        <div className="gloss-section-title">Where does RiskScore come from?</div>
        <div className="gloss-grid">
          <div className="gloss-card">
            <div className="gloss-term">RiskScore (computed, not measured)</div>
            <div className="gloss-formula">
              RiskScore = 50 + 15 × (tempWeight·z(Temp) − dryWeight·z(Precip)) / σ
            </div>
            <div className="gloss-def">
              NOAA gives real temperature and precipitation, but no "risk" number — that's a judgment call.
              We z-score each variable against the city's own baseline (how unusual is this year for this
              city?), then blend them using your two sliders. Turning Temperature weight to 0 means only
              dryness drives the score; turning Dryness to 0 means only temperature does.
            </div>
            <div className="gloss-eg">
              Default (60 temp / 40 dry) treats a hot, dry year as higher risk than a hot, wet one.
            </div>
          </div>
        </div>
      </div>

      <div className="gloss-section">
        <div className="gloss-section-title">Output Metrics — what each number means</div>
        <div className="gloss-grid">
          <div className="gloss-card">
            <div className="gloss-term">
              R² Score
              <span className="badge badge-good">≥0.85 good</span>
              <span className="badge badge-warn">0.6–0.85 ok</span>
              <span className="badge badge-bad">&lt;0.6 weak</span>
            </div>
            <div className="gloss-formula">R² = 1 − (SS_res / SS_tot)</div>
            <div className="gloss-def">
              The fraction of variation in RiskScore explained by Temperature and Precipitation. With real
              data, expect this lower than a synthetic dataset — actual weather has noise and other drivers
              the model doesn't see.
            </div>
          </div>

          <div className="gloss-card">
            <div className="gloss-term">MSE — Mean Squared Error</div>
            <div className="gloss-formula">MSE = Σ(actual − predicted)² / n</div>
            <div className="gloss-def">
              The average squared gap between predicted and actual RiskScore. Lower is better, but only
              comparable across runs on the same scale.
            </div>
          </div>

          <div className="gloss-card">
            <div className="gloss-term">Mean / Median Risk Score</div>
            <div className="gloss-formula">mean = Σ(x)/n, median = middle value</div>
            <div className="gloss-def">
              The average and the middle value of RiskScore across all complete years. If they differ a lot,
              a handful of extreme years are skewing the average.
            </div>
          </div>

          <div className="gloss-card">
            <div className="gloss-term">σ — Standard Deviation</div>
            <div className="gloss-formula">σ = √(Σ(x − mean)² / n)</div>
            <div className="gloss-def">
              How spread out RiskScore is year to year. A small σ means stable risk; a large σ means
              volatile risk.
            </div>
          </div>
        </div>
      </div>

      <div className="gloss-section">
        <div className="gloss-section-title">Regression Model — how it works</div>
        <div className="gloss-grid">
          <div className="gloss-card">
            <div className="gloss-term">Multiple Linear Regression</div>
            <div className="gloss-def">
              Fits a straight-line relationship between Temperature, Precipitation, and RiskScore. Finds
              b0, b1, b2 that minimize prediction error. Assumes the relationship is linear and additive.
            </div>
          </div>
          <div className="gloss-card">
            <div className="gloss-term">b1 — Temperature coefficient</div>
            <div className="gloss-formula">risk change per 1°C increase</div>
            <div className="gloss-def">
              For every extra degree, RiskScore changes by b1 points, holding precipitation constant.
            </div>
          </div>
          <div className="gloss-card">
            <div className="gloss-term">b2 — Precipitation coefficient</div>
            <div className="gloss-formula">risk change per 1mm increase</div>
            <div className="gloss-def">
              For every extra millimetre of rain, RiskScore changes by b2 points, holding temperature
              constant. Usually negative since the formula treats dryness as risk-increasing.
            </div>
          </div>
          <div className="gloss-card">
            <div className="gloss-term">Correlation (r)</div>
            <div className="gloss-formula">r ∈ [−1, +1]</div>
            <div className="gloss-def">
              How strongly each variable moves with RiskScore on its own, independent of the regression fit.
            </div>
          </div>
        </div>
      </div>

      <div className="gloss-section">
        <div className="gloss-section-title">Anomaly Detection</div>
        <div className="gloss-grid">
          <div className="gloss-card">
            <div className="gloss-term">
              Anomaly <span className="badge badge-bad">red highlight</span>
            </div>
            <div className="gloss-formula">|RiskScore − mean| &gt; 2σ</div>
            <div className="gloss-def">
              A year is flagged if its RiskScore is more than 2 standard deviations from this city's
              average. With real data, this often lines up with documented extreme years — heat waves,
              droughts, unusually wet years.
            </div>
          </div>
        </div>
      </div>

      <div className="gloss-section">
        <div className="gloss-section-title">About the data</div>
        <div className="gloss-grid">
          <div className="gloss-card">
            <div className="gloss-term">Source</div>
            <div className="gloss-def">
              NOAA Climate Data Online, Global Summary of the Year (GSOY) dataset, via four fixed weather
              stations (NYC Central Park, Chicago O'Hare, Phoenix Sky Harbor, Seattle-Tacoma). Real station
              records sometimes have missing years — incomplete years are dropped rather than estimated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
