/** 名前と内蔵かどうかだけを見る。SpeechSynthesisVoiceでもVoiceOptionでも渡せる形 */
export interface VoiceLike {
  readonly name: string;
  readonly isLocal: boolean;
}

/** ニューラル音声はこの語を名前に含む(例: Microsoft Nanami Online (Natural)) */
const NATURAL_PATTERN = /natural|neural/i;

/**
 * 自然さの見込みが高い順に小さい値を返す。
 * 一覧の並び順にだけ使う(自動選択はオフラインで確実に鳴る内蔵音声を優先する)。
 */
export function isNaturalVoice(voice: VoiceLike): boolean {
  return NATURAL_PATTERN.test(voice.name);
}

export function voiceQualityRank(voice: VoiceLike): number {
  if (isNaturalVoice(voice)) return 0;
  if (voice.isLocal) return 1;
  return 2;
}

export function compareVoices(a: VoiceLike, b: VoiceLike): number {
  const diff = voiceQualityRank(a) - voiceQualityRank(b);
  return diff !== 0 ? diff : a.name.localeCompare(b.name, 'ja');
}
