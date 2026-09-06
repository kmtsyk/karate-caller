import type { Grade } from '../domain/grade';
import kyu4 from './kyu4.txt?raw';

/**
 * 級ごとの初期リスト。
 * .txtの中身はアプリの技名リストエディタと同じ形式なので、画面からコピーした内容を
 * そのまま貼り付けられる(「#」始まりの行は分類コメントとして無視される)。
 *
 * 4級は本人から受け取った審査科目。3〜1級は内容が未確認なので空にしてある
 * (推測で埋めると練習内容そのものが間違うため、アプリ内で貼り付けてもらう)。
 * 内容が判明したら kyu3.txt などを追加してここに繋ぐ。
 */
const DEFAULT_LISTS: Record<Grade, string> = {
  kyu4,
  kyu3: '',
  kyu2: '',
  kyu1: '',
};

export function defaultListOf(grade: Grade): string {
  return DEFAULT_LISTS[grade];
}
