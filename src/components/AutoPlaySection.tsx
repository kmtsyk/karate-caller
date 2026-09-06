import type { IntervalMode, Settings } from '../domain/technique';
import type { AutoPlayerState } from '../hooks/useAutoPlayer';

interface Props {
  readonly player: AutoPlayerState;
  readonly settings: Settings;
  onSettingsChange(settings: Settings): void;
}

const MODE_LABELS: Record<IntervalMode, string> = {
  uniform: '一律秒数',
  perTechnique: '型ごとの秒数',
};

export function AutoPlaySection({ player, settings, onSettingsChange }: Props) {
  const { isRunning, current, isRevealed, remainingSec, toggle } = player;
  const isMasked = current !== null && !isRevealed;

  return (
    <section className="card">
      <h2>自動ランダム読み上げ(一人で練習用)</h2>

      <div className="stage">
        <p className={isMasked ? 'waza-display is-masked' : 'waza-display'}>
          {current === null ? '押忍' : isRevealed ? current.name : '?'}
        </p>
        <p className="yomi-display">{isRevealed ? (current?.reading ?? '') : ''}</p>
        <p className={isRunning ? 'status is-running' : 'status'}>
          <span className="status-dot" aria-hidden="true" />
          {isRunning ? `読み上げ中 · 次まで${remainingSec ?? '-'}秒` : '停止中'}
        </p>
      </div>

      <button
        className={isRunning ? 'toggle-button is-running' : 'toggle-button'}
        onClick={toggle}
      >
        {isRunning ? '■ 停止' : '▶ 開始'}
      </button>

      <div className="segmented" role="radiogroup" aria-label="間隔の決め方">
        {(Object.keys(MODE_LABELS) as IntervalMode[]).map((mode) => (
          <label key={mode} className="segmented-item">
            <input
              type="radio"
              name="mode"
              checked={settings.mode === mode}
              onChange={() => onSettingsChange({ ...settings, mode })}
            />
            <span>{MODE_LABELS[mode]}</span>
          </label>
        ))}
      </div>

      <div className="row">
        <label htmlFor="interval">一律間隔</label>
        <input
          id="interval"
          type="range"
          min={2}
          max={30}
          step={1}
          value={settings.uniformIntervalSec}
          onChange={(e) =>
            onSettingsChange({ ...settings, uniformIntervalSec: Number(e.target.value) })
          }
        />
        <span className="value-badge">{settings.uniformIntervalSec}秒</span>
      </div>
    </section>
  );
}
