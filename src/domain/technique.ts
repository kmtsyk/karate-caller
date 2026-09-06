export interface Technique {
  readonly name: string;
  /** TTSに渡す読み仮名。nullなら表示名をそのまま渡す(誤読リスクあり) */
  readonly reading: string | null;
  /** 型ごとの間隔(秒)。nullなら一律設定にフォールバック */
  readonly intervalSec: number | null;
}

export type IntervalMode = 'uniform' | 'perTechnique';

/** 出題順。間隔の決め方とは独立した軸 */
export type OrderMode = 'random' | 'sequential';

export interface Settings {
  readonly mode: IntervalMode;
  readonly order: OrderMode;
  readonly uniformIntervalSec: number;
  /** 使う音声のURI。nullなら端末の日本語音声から自動選択 */
  readonly voiceUri: string | null;
  /** 読み上げ速度(1が標準) */
  readonly rate: number;
  /** 声の高さ(1が標準。下げると低い声になる) */
  readonly pitch: number;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'uniform',
  order: 'random',
  uniformIntervalSec: 5,
  voiceUri: null,
  rate: 0.9,
  pitch: 1,
};

/** 音声エンジンに渡すべきテキストの決定。誤読対策の核心はこの1行 */
export function spokenTextOf(technique: Technique): string {
  return technique.reading ?? technique.name;
}