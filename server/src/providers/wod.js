import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DICTIONARY_PATH = join(__dirname, '../../data/dictionary.json');

export async function getWod() {
  const raw = await readFile(DICTIONARY_PATH, 'utf8');
  const words = JSON.parse(raw);
  if (!words.length) throw new Error('Dictionary is empty');
  const entry = words[Math.floor(Math.random() * words.length)];
  return {
    word: entry.word,
    pronunciation: entry.pronunciation || null,
    definitions: Array.isArray(entry.definitions) ? entry.definitions : [entry.definitions],
    example: entry.example || null
  };
}
