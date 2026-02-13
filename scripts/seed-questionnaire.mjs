#!/usr/bin/env node
/**
 * Seeds the questionnaires table with RO and/or EN questionnaire (plain JSON).
 * Run: npm run seed          (seeds both RO and EN)
 * Run: npm run seed -- --language=RO
 * Run: npm run seed -- --language=EN
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * For upsert to work (replacing existing rows), run in Supabase SQL Editor:
 *   create policy "Allow anon update" on public.questionnaires for update using (true) with check (true);
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env and run again.'
  );
  process.exit(1);
}

const langArg = process.argv.find((a) => a.startsWith('--language='));
const languages = langArg
  ? [langArg.replace('--language=', '').toUpperCase()]
  : ['RO', 'EN'];

const supabase = createClient(url, key);

const files = { RO: 'questionnaire-ro.json', EN: 'questionnaire-en.json' };

for (const lang of languages) {
  const file = files[lang];
  if (!file) {
    console.error('Unknown language:', lang, '(use RO or EN)');
    process.exit(1);
  }
  const contentPath = join(__dirname, file);
  const content = JSON.parse(readFileSync(contentPath, 'utf8'));

  const { error } = await supabase
    .from('questionnaires')
    .upsert({ language: lang, content }, { onConflict: 'language' })
    .select();

  if (error) {
    console.error('Seed failed for', lang + ':', error.message);
    process.exit(1);
  }
  console.log('Questionnaire seeded successfully for language', lang + '.');
}
