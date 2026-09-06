import type { VoiceOption } from '../application/ports';
import type { Settings } from '../domain/technique';
import { isNaturalVoice } from '../domain/voicePreference';

function labelOf(voice: VoiceOption): string {
  if (isNaturalVoice(voice)) return `${voice.name}(高音質・要ネット)`;
  return voice.isLocal ? voice.name : `${voice.name}(オンライン)`;
}

interface Props {
  readonly voices: readonly VoiceOption[];
  readonly settings: Settings;
  onSettingsChange(settings: Settings): void;
  onPreview(): void;
}

export function VoiceSection({ voices, settings, onSettingsChange, onPreview }: Props) {
  return (
    <section className="card">
      <h2>音声</h2>

      <div className="row">
        <label htmlFor="voice">声</label>
        <select
          id="voice"
          value={settings.voiceUri ?? ''}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              voiceUri: e.target.value === '' ? null : e.target.value,
            })
          }
        >
          <option value="">自動(端末内蔵を優先)</option>
          {voices.map((voice) => (
            <option key={voice.uri} value={voice.uri}>
              {labelOf(voice)}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <label htmlFor="rate">速さ</label>
        <input
          id="rate"
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={settings.rate}
          onChange={(e) => onSettingsChange({ ...settings, rate: Number(e.target.value) })}
        />
        <span className="value-badge">{settings.rate.toFixed(1)}倍</span>
      </div>

      <div className="row">
        <label htmlFor="pitch">高さ</label>
        <input
          id="pitch"
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={settings.pitch}
          onChange={(e) =>
            onSettingsChange({ ...settings, pitch: Number(e.target.value) })
          }
        />
        <span className="value-badge">{settings.pitch.toFixed(1)}</span>
      </div>

      <div className="editor-footer">
        <span className="hint">
          {voices.length === 0
            ? '端末の日本語音声が見つかりません(既定の音声で読み上げます)'
            : `日本語音声 ${voices.length}件 · 自然さの見込み順`}
        </span>
        <button type="button" className="text-button" onClick={onPreview}>
          試聴
        </button>
      </div>

      {/* 音質はOS側の音声データで決まるため、アプリの設定では上限がある */}
      <p className="hint hint-block">
        機械的に聞こえる場合は、OSの設定から高品質版の音声を追加すると改善します。
        macOSはシステム設定 → アクセシビリティ → 音声コンテンツ → システムの声 →
        「声を管理」、iOSは設定 → アクセシビリティ → 読み上げコンテンツ →
        声。追加後はブラウザを再起動してください。
      </p>
    </section>
  );
}
