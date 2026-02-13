#!/usr/bin/env node
/**
 * Tests that submission_results save/read works.
 * Run: npm run test:save-result
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * Requires: submission_results table and RPCs (run supabase_schema.sql in SQL Editor).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const sampleResult = {
  phase: 'Rebuild',
  experienceState: 'Challenging',
  phaseScoreBreakdown: { Awareness: 1, Stabilization: 2, Rebuild: 5, Integration: 0 },
  strainScore: 4,
};

async function main() {
  console.log('1. Creating a test submission...');
  const { data: submissionId, error: insertErr } = await supabase.rpc('insert_submission', {
    p_language: 'EN',
    p_questionnaire_language: 'EN',
    p_responses: { HoldingThingsTogether: 1, FeelsFinished: 0 },
    p_email: null,
  });

  if (insertErr) {
    console.error('Insert submission failed:', insertErr.message);
    process.exit(1);
  }
  console.log('   Submission ID:', submissionId);

  console.log('2. Saving transition result...');
  const { error: saveErr } = await supabase.rpc('save_submission_result', {
    p_submission_id: submissionId,
    p_phase: sampleResult.phase,
    p_experience_state: sampleResult.experienceState,
    p_phase_score_breakdown: sampleResult.phaseScoreBreakdown,
    p_strain_score: sampleResult.strainScore,
    p_force: false,
  });

  if (saveErr) {
    console.error('Save result failed:', saveErr.message);
    process.exit(1);
  }
  console.log('   Saved.');

  console.log('3. Fetching stored result...');
  const { data: stored, error: getErr } = await supabase.rpc('get_submission_result', {
    p_submission_id: submissionId,
  });

  if (getErr) {
    console.error('Get result failed:', getErr.message);
    process.exit(1);
  }

  if (!stored) {
    console.error('Get returned null');
    process.exit(1);
  }

  const ok =
    stored.phase === sampleResult.phase &&
    stored.experienceState === sampleResult.experienceState &&
    stored.strainScore === sampleResult.strainScore &&
    stored.phaseScoreBreakdown &&
    stored.computed_at;

  if (!ok) {
    console.error('Stored result mismatch. Expected phase/Rebuild, experienceState/Challenging, strainScore/4, computed_at set.');
    console.error('Got:', JSON.stringify(stored, null, 2));
    process.exit(1);
  }

  console.log('   Fetched:', JSON.stringify(stored, null, 2));
  console.log('\n✓ Save and read work. submission_results is correct.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
