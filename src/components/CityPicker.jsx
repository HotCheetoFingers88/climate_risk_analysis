export default function CityPicker({ cities, selectedId, onSelect, loading, error }) {
  if (loading) {
    return <div className="status-banner loading"><span className="spinner" />Loading cities…</div>;
  }
  if (error) {
    return <div className="status-banner error">⚠ Could not load city list: {error}</div>;
  }

  return (
    <div className="city-grid">
      {cities.map((city) => (
        <button
          key={city.id}
          type="button"
          className={`city-card${city.id === selectedId ? ' selected' : ''}`}
          onClick={() => onSelect(city.id)}
        >
          <div className="city-name">{city.label}</div>
          <div className="city-meta">{city.station.replace('GHCND:', '')}</div>
        </button>
      ))}
    </div>
  );
}
