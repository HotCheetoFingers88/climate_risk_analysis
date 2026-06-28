import { useState, useEffect, useCallback } from 'react';

export function useCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/cities')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load cities (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCities(data.cities || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { cities, loading, error };
}

export function useClimateData(cityId, startYear, endYear) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!cityId) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      city: cityId,
      start: String(startYear),
      end: String(endYear),
    });
    fetch(`/api/climate?${params}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then((body) => setData(body))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cityId, startYear, endYear]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
