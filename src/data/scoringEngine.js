/**
 * Deterministic scoring engine driven entirely by TransitionScoringMap.json.
 * No hardcoded phase names; all logic from config. Pure function (no UI or DB).
 */

/**
 * Normalize response value to number (accepts OptionValue as number or string from DB).
 * @param {unknown} raw
 * @returns {number|null}
 */
function toOptionValue(raw) {
  if (raw === undefined || raw === null) return null;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Compute transition result from saved responses and scoring map.
 *
 * @param {Record<string, number | string>} responses - Saved responses: { DataPointName: OptionValue, ... }
 * @param {object} scoringMap - TransitionScoringMap (PhaseOrder, PhaseByDataPoint, StrainDataPoints, Thresholds, TieBreak)
 * @returns {{ phase: string, experienceState: string, phaseScoreBreakdown: Record<string, number>, strainScore: number }}
 */
export function computeTransitionResult(responses, scoringMap) {
  const phaseOrder = scoringMap.PhaseOrder || [];
  const phaseByDataPoint = scoringMap.PhaseByDataPoint || {};
  const strainDataPoints = scoringMap.StrainDataPoints || [];
  const thresholds = scoringMap.Thresholds || {};
  const tieBreak = scoringMap.TieBreak || {};

  // 1. Initialize phase score buckets using PhaseOrder
  const phaseScoreBreakdown = {};
  phaseOrder.forEach((phase) => {
    phaseScoreBreakdown[phase] = 0;
  });

  // 2. Iterate through responses: look up phase, add OptionValue to phase total and optionally to strainScore
  let strainScore = 0;
  for (const [dataPointName, rawValue] of Object.entries(responses)) {
    const optionValue = toOptionValue(rawValue);
    if (optionValue === null) continue;

    const phase = phaseByDataPoint[dataPointName];
    if (phase != null && phaseOrder.includes(phase)) {
      phaseScoreBreakdown[phase] = (phaseScoreBreakdown[phase] ?? 0) + optionValue;
    }
    if (strainDataPoints.includes(dataPointName)) {
      strainScore += optionValue;
    }
  }

  // 3. Determine dominant phase (highest score; on tie apply TieBreak.strategy using PhaseOrder)
  let phase = phaseOrder[0] ?? null;
  let maxScore = -1;
  for (const p of phaseOrder) {
    const score = phaseScoreBreakdown[p] ?? 0;
    if (score > maxScore) {
      maxScore = score;
      phase = p;
    } else if (score === maxScore && score >= 0 && tieBreak.strategy === 'prefer_later_phase') {
      const idxCurrent = phaseOrder.indexOf(phase);
      const idxCandidate = phaseOrder.indexOf(p);
      if (idxCandidate > idxCurrent) phase = p;
    }
  }

  // 4. Determine experienceState from Thresholds.StrainChallengingMin
  const strainChallengingMin = thresholds.StrainChallengingMin;
  const experienceState =
    strainChallengingMin != null && strainScore >= strainChallengingMin
      ? 'Challenging'
      : 'Supported';

  return {
    phase,
    experienceState,
    phaseScoreBreakdown,
    strainScore,
  };
}

/**
 * @deprecated Use computeTransitionResult. Kept for compatibility; returns legacy shape.
 */
export function computeScore(responses, scoringMap) {
  const result = computeTransitionResult(responses, scoringMap);
  return {
    phaseScores: result.phaseScoreBreakdown,
    dominantPhase: result.phase,
    strainScore: result.strainScore,
    experienceState: result.experienceState,
  };
}
