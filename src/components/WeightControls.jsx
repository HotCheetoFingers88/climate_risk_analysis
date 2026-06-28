export default function WeightControls({ weights, onChange }) {
  return (
    <div className="weight-controls">
      <div className="weight-control">
        <label>
          <span>Temperature weight</span>
          <span className="weight-value">{weights.tempWeight}</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={weights.tempWeight}
          onChange={(e) => onChange({ ...weights, tempWeight: Number(e.target.value) })}
          aria-label="Temperature weight"
        />
        <div className="weight-hint">How much warmer-than-average years raise the risk score.</div>
      </div>

      <div className="weight-control">
        <label>
          <span>Dryness weight</span>
          <span className="weight-value">{weights.dryWeight}</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={weights.dryWeight}
          onChange={(e) => onChange({ ...weights, dryWeight: Number(e.target.value) })}
          aria-label="Dryness weight"
        />
        <div className="weight-hint">How much drier-than-average years raise the risk score.</div>
      </div>
    </div>
  );
}
