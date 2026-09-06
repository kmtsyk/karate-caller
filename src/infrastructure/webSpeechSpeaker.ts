import type { Speaker } from '../application/ports';

/** 音声の見え方に関する設定(Settingsの音声関連フィールドだけを切り出したもの) */
export interface VoicePrefs {
  readonly voiceUri: string | null;
  readonly rate: number;
  readonly pitch: number;
}

const DEFAULT_PREFS: VoicePrefs = { voiceUri: null, rate: 0.9, pitch: 1 };

export class WebSpeechSpeaker implements Speaker {
  private readonly synth = window.speechSynthesis;
  private prefs: VoicePrefs = DEFAULT_PREFS;

  /** 設定変更のたびにReact側から流し込む(speakのたびに引数を増やさないための可変状態) */
  configure(prefs: VoicePrefs): void {
    this.prefs = prefs;
  }

  speak(text: string): void {
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = this.prefs.rate;
    utterance.pitch = this.prefs.pitch;
    const voice = this.pickVoice();
    if (voice) utterance.voice = voice;
    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth.cancel();
  }

  /**
   * 設定で選ばれた音声を使う。
   * 未選択や、選択済みの音声が消えた場合(OSから削除等)は端末内蔵(localService)の
   * 日本語音声を優先してフォールバックする。
   * ニューラル音声のほうが自然だが通信必須で、道場など回線がない場所で無音になるため
   * 自動選択では採用しない(明示的に選ぶのは可)。
   */
  private pickVoice(): SpeechSynthesisVoice | null {
    const voices = this.synth.getVoices();
    const { voiceUri } = this.prefs;
    if (voiceUri !== null) {
      const chosen = voices.find((v) => v.voiceURI === voiceUri);
      if (chosen !== undefined) return chosen;
    }
    const jaVoices = voices.filter((v) => v.lang.startsWith('ja'));
    return jaVoices.find((v) => v.localService) ?? jaVoices[0] ?? null;
  }
}
