import { supabase } from './supabaseClient';

// We store the questionnaire in a `questionnaires` table as:
// id (uuid) | language (text) | content (jsonb)
// where `content` has the same shape as `mockData.questionnaire`.

export async function fetchQuestionnaireByLanguage(language = 'RO') {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('content')
    .eq('language', language.toUpperCase())
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[Supabase] Failed to fetch questionnaire', error);
    throw error;
  }

  if (!data || !data.content) {
    throw new Error('Questionnaire not found for language: ' + language);
  }

  return data.content;
}

// submissions table example schema:
// id (uuid) | language (text) | questionnaire_language (text)
// | responses (jsonb) | email (text) | created_at (timestamptz default now())

export async function saveSubmission({ language, responses, email }) {
  const payload = {
    language: language?.toUpperCase() ?? 'RO',
    questionnaire_language: language?.toUpperCase() ?? 'RO',
    responses,
    email: email ?? null,
  };

  const { data, error } = await supabase.from('submissions').insert(payload).select('id').single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[Supabase] Failed to save submission', error);
    throw error;
  }

  return data.id;
}

