/**
 * RiskScore is not something NOAA provides — it's a composite index we
 * compute from real temperature and precipitation data. Since "risk" means
 * different things to different people, the weights are user-adjustable
 * rather than fixed, and the formula is kept simple enough to explain in
 * one sentence (see Glossary).
 *
 * Method: z-score each variable against the city's own multi-year baseline,
 * then combine with user weights. Warmer-than-baseline and drier-than-baseline
 * both push risk up by default (climate-risk convention), each scaled by a
 * 0-100 importance slider.
 */

export function mean(vals) {
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function stdDev(vals) {
  const m = mean(vals);
  const variance = mean(vals.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

function zScores(vals) {
  const m = mean(vals);
  const sd = stdDev(vals) || 1; // avoid divide-by-zero on constant series
  return vals.map((v) => (v - m) / sd);
}

/**
 * weights: { tempWeight: 0-100, dryWeight: 0-100 }
 * Returns RiskScore on a 0-100ish open scale (can exceed 100 for extreme years).
 */
export function computeRiskScores(temperatures, precipitations, weights) {
  const tempZ = zScores(temperatures);
  const precipZ = zScores(precipitations);

  const tw = weights.tempWeight / 100;
  const dw = weights.dryWeight / 100;

  // Higher temp z-score -> more risk. Lower (more negative) precip z-score
  // (drier than baseline) -> more risk, so we negate it.
  const rawScores = tempZ.map((tz, i) => tw * tz - dw * precipZ[i]);

  // Rescale to a friendlier 0-100ish band centered at 50, so it reads like
  // the original synthetic dataset's RiskScore rather than a raw z-score.
  const rawMean = mean(rawScores);
  const rawSd = stdDev(rawScores) || 1;
  return rawScores.map((r) => Math.round((50 + ((r - rawMean) / rawSd) * 15) * 10) / 10);
}

export const DEFAULT_WEIGHTS = { tempWeight: 60, dryWeight: 40 };
