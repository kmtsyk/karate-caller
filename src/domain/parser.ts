import type { Technique } from './technique';

const KANA_PATTERN = /^[ぁ-んァ-ヶー・\s]+$/u;

/**
 * 「表示名,読み,秒数」形式をパースする(読み・秒数は順不同かつ省略可)。
 * フィールドの内容で役割を判別: 正の数値 → 秒数、かなのみ → 読み。
 */
export function parseTechniques(raw: string): Technique[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseLine)
    .filter((t): t is Technique => t !== null);
}

function parseLine(line: string): Technique | null {
  const [name, ...rest] = line.split(/[,、]/).map((s) => s.trim());
  if (name === undefined || name.length === 0) return null;

  let reading: string | null = null;
  let intervalSec: number | null = null;

  for (const field of rest) {
    if (field.length === 0) continue;
    const num = Number(field);
    if (Number.isFinite(num) && num > 0) {
      intervalSec = num;
    } else if (KANA_PATTERN.test(field)) {
      reading = field;
    }
  }
  return { name, reading, intervalSec };
}