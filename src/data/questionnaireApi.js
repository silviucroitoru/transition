import { supabase } from './supabaseClient';

// Questionnaires table: id | language | content (jsonb)
// App expects content = { info: [ { QuestionType, settings, DataPointName, position }, ... ] }.

export async function fetchQuestionnaireByLanguage(language = 'EN') {
  const lang = (language || 'EN').toString().trim();
  const upper = lang.toUpperCase();
  const lower = lang.toLowerCase();

  let result = await supabase
    .from('questionnaires')
    .select('content')
    .eq('language', upper)
    .maybeSingle();

  if (result.error) {
    console.error('[Supabase] Failed to fetch questionnaire', result.error);
    throw result.error;
  }

  if (!result.data?.content && upper !== lower) {
    result = await supabase
      .from('questionnaires')
      .select('content')
      .eq('language', lower)
      .maybeSingle();
  }

  if (result.data?.content) {
    return result.data.content;
  }

  throw new Error('Questionnaire not found for language: ' + language);
}

// submissions table: id | language | questionnaire_language | responses (jsonb) | email | created_at
// Insert via a SECURITY DEFINER RPC so RLS stays enabled (no public read/update/delete).

export async function saveSubmission({ language, responses, email }) {
  const { data, error } = await supabase.rpc('insert_submission', {
    p_language: language?.toUpperCase() ?? 'EN',
    p_questionnaire_language: language?.toUpperCase() ?? 'EN',
    p_responses: responses,
    p_email: email ?? null,
  });

  if (error) {
    console.error('[Supabase] Failed to save submission', error);
    throw new Error(error?.message || 'Failed to save');
  }

  return data;
}

// submission_results: store computed transition result per submission (idempotent; single source of truth for results, email, analytics).

/**
 * Persist computed transition result for a submission. Does not overwrite existing result unless force is true.
 * @param {string} submissionId - UUID from saveSubmission
 * @param {{ phase: string, experienceState: string, phaseScoreBreakdown: Record<string, number>, strainScore: number }} result - Output from computeTransitionResult
 * @param {{ force?: boolean }} [options] - Set force: true to overwrite existing result
 */
export async function saveTransitionResult(submissionId, result, options = {}) {
  const { error } = await supabase.rpc('save_submission_result', {
    p_submission_id: submissionId,
    p_phase: result.phase,
    p_experience_state: result.experienceState,
    p_phase_score_breakdown: result.phaseScoreBreakdown,
    p_strain_score: result.strainScore,
    p_force: options.force ?? false,
  });

  if (error) {
    console.error('[Supabase] Failed to save transition result', error);
    throw new Error(error?.message || 'Failed to save result');
  }
}

/**
 * Fetch stored transition result by submission id. Returns null if none.
 * @param {string} submissionId - UUID from localStorage SubmissionID
 * @returns {Promise<{ phase: string, experienceState: string, phaseScoreBreakdown: Record<string, number>, strainScore: number, computed_at: string } | null>}
 */
export async function getTransitionResult(submissionId) {
  if (!submissionId) return null;
  const { data, error } = await supabase.rpc('get_submission_result', {
    p_submission_id: submissionId,
  });

  if (error) {
    console.warn('[Supabase] Failed to fetch transition result', error);
    return null;
  }

  return data ?? null;
}
