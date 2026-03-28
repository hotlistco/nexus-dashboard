import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT  = join(__dirname, 'dictionary.json');
const OUTPUT = join(__dirname, 'dictionary-improved.json');
const API    = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DELAY  = 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractPronunciation(phonetics) {
  const hit = phonetics.find((p) => p.text);
  return hit?.text || null;
}

function extractMeanings(meanings) {
  return (meanings || []).map((meaning) => ({
    partOfSpeech: meaning.partOfSpeech || null,
    definitions: (meaning.definitions || []).map((d) => d.definition),
    synonyms: [...new Set([
      ...(meaning.synonyms || []),
      ...(meaning.definitions || []).flatMap((d) => d.synonyms || [])
    ])],
    antonyms: [...new Set([
      ...(meaning.antonyms || []),
      ...(meaning.definitions || []).flatMap((d) => d.antonyms || [])
    ])]
  }));
}

const current = JSON.parse(await readFile(INPUT, 'utf8'));

// Load existing output to resume from where we left off
const completed = existsSync(OUTPUT)
  ? JSON.parse(await readFile(OUTPUT, 'utf8'))
  : [];

const doneWords = new Set(completed.map((e) => e.word));
const remaining = current.filter((e) => !doneWords.has(e.word));

console.log(`${doneWords.size} already done, ${remaining.length} remaining.`);

for (const entry of remaining) {
  await sleep(DELAY);

  const res = await fetch(`${API}/${encodeURIComponent(entry.word)}`);

  if (!res.ok) {
    console.error(`FAILED on "${entry.word}" — HTTP ${res.status}`);
    console.error(`Progress saved (${completed.length}/${current.length}). Re-run to resume.`);
    await writeFile(OUTPUT, JSON.stringify(completed, null, 2));
    process.exit(1);
  }

  const data = await res.json();
  const api = data[0];

  completed.push({
    word: entry.word,
    pronunciation: extractPronunciation(api.phonetics) || entry.pronunciation,
    meanings: extractMeanings(api.meanings),
    example: entry.example
  });

  console.log(`[${completed.length}/${current.length}] ${entry.word}`);

  // Save after every word so a crash mid-run loses nothing
  await writeFile(OUTPUT, JSON.stringify(completed, null, 2));
}

console.log(`\nDone. All ${completed.length} words written to dictionary-improved.json`);
