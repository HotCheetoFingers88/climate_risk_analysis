import { useState, useCallback } from 'react';

export function useAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback((years, temperatures, precipitations, risks) => {
    setLoading(true);
    setError(null);
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ years, temperatures, precipitations, risks }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Analysis failed (${res.status})`);
        return body;
      })
      .then((body) => setResult(body))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { result, loading, error, runAnalysis };
}
