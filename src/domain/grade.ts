/** 審査の級。技名リストは級ごとに独立して持つ */
export type Grade = 'kyu4' | 'kyu3' | 'kyu2' | 'kyu1';

/** 表示順(習得順) */
export const GRADES: readonly Grade[] = ['kyu4', 'kyu3', 'kyu2', 'kyu1'];

export const GRADE_LABELS: Record<Grade, string> = {
  kyu4: '4級',
  kyu3: '3級',
  kyu2: '2級',
  kyu1: '1級',
};

export const DEFAULT_GRADE: Grade = 'kyu4';

/** localStorageの値は信用できないため、読み込み時に必ず通す */
export function isGrade(value: unknown): value is Grade {
  return typeof value === 'string' && GRADES.includes(value as Grade);
}
