import type { CancelFn, VoiceCatalog, VoiceOption } from '../application/ports';
import { compareVoices } from '../domain/voicePreference';

/** 空一覧は毎回同じ参照を返す(useSyncExternalStoreが無限ループになるのを防ぐ) */
const EMPTY: readonly VoiceOption[] = [];

export class WebSpeechVoiceCatalog implements VoiceCatalog {
  private readonly synth = window.speechSynthesis;
  private snapshot: readonly VoiceOption[] = EMPTY;
  private readonly listeners = new Set<() => void>();

  constructor() {
    // getVoices()の初回呼び出し自体がロードの契機になる端末がある
    this.refresh();
    // iOS/Chromeは音声リストを遅延ロードするため、揃った時点で取り直す
    this.synth.addEventListener?.('voiceschanged', () => this.refresh());
  }

  list(): readonly VoiceOption[] {
    return this.snapshot;
  }

  subscribe(listener: () => void): CancelFn {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  refresh(): void {
    const next = this.synth
      .getVoices()
      .filter((v) => v.lang.startsWith('ja'))
      // 同一URIが重複して並ぶ端末があるため一意にする
      .filter((v, i, all) => all.findIndex((x) => x.voiceURI === v.voiceURI) === i)
      .map((v) => ({ uri: v.voiceURI, name: v.name, isLocal: v.localService }))
      // 自然に聞こえる見込みが高い順。機械的な音声を選ばされないようにする
      .sort(compareVoices);

    if (isSameVoices(this.snapshot, next)) return;
    this.snapshot = next.length === 0 ? EMPTY : next;
    this.listeners.forEach((listener) => listener());
  }
}

function isSameVoices(a: readonly VoiceOption[], b: readonly VoiceOption[]): boolean {
  return a.length === b.length && a.every((voice, i) => voice.uri === b[i].uri);
}
