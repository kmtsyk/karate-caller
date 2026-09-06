import type { ReactNode } from 'react';
import type { ThemeSetting } from '../domain/theme';
import type { ThemeState } from '../hooks/useTheme';

interface Props {
  readonly theme: ThemeState;
}

const THEME_LABELS: Record<ThemeSetting, string> = {
  system: '端末に合わせる',
  light: 'ライト',
  dark: 'ダーク',
};

// 24x24のstroke系アイコン。色はcurrentColorに委ね、CSS側のテーマ変数に追従させる
const THEME_ICONS: Record<ThemeSetting, ReactNode> = {
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  light: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path
        d="M20 14.4A8.6 8.6 0 0 1 9.6 4 8.7 8.7 0 1 0 20 14.4Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function ThemeToggle({ theme }: Props) {
  const { setting, setSetting } = theme;

  return (
    <div className="segmented theme-toggle" role="group" aria-label="配色テーマ">
      {(Object.keys(THEME_LABELS) as ThemeSetting[]).map((candidate) => (
        <button
          key={candidate}
          type="button"
          className="segmented-button"
          aria-pressed={setting === candidate}
          title={THEME_LABELS[candidate]}
          onClick={() => setSetting(candidate)}
        >
          <span aria-hidden="true">{THEME_ICONS[candidate]}</span>
          <span className="visually-hidden">{THEME_LABELS[candidate]}</span>
        </button>
      ))}
    </div>
  );
}
