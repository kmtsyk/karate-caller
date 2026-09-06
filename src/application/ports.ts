/** 音声出力の抽象。実装: WebSpeechSpeaker(将来: mp3再生、テスト: FakeSpeaker) */
export interface Speaker {
  speak(text: string): void;
  stop(): void;
}

export type CancelFn = () => void;

/** 時間経過の抽象。実装: setTimeout(テスト: 手動で時間を進めるFake) */
export interface Scheduler {
  schedule(callback: () => void, delayMs: number): CancelFn;
}

/** 選択肢として見せる音声。SpeechSynthesisVoiceそのものを外に漏らさないための形 */
export interface VoiceOption {
  readonly uri: string;
  readonly name: string;
  /** 端末内蔵(オフラインで使える)かどうか */
  readonly isLocal: boolean;
}

/** 利用可能な音声一覧の抽象。実装: WebSpeechVoiceCatalog(テスト: 固定配列のFake) */
export interface VoiceCatalog {
  /** 同じ内容なら同じ参照を返す(useSyncExternalStoreの要求) */
  list(): readonly VoiceOption[];
  subscribe(listener: () => void): CancelFn;
  /** 端末が一覧を遅延ロードするため、任意のタイミングで再取得を促す */
  refresh(): void;
}

/** OSの配色設定の抽象。実装: MediaQueryColorScheme(テスト: 固定値のFake) */
export interface ColorSchemeSource {
  prefersDark(): boolean;
  /** OS側の切り替えを購読する。戻り値を呼ぶと解除 */
  subscribe(listener: (prefersDark: boolean) => void): CancelFn;
}