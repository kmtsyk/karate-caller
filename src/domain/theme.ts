/** ユーザーが選ぶ設定値。systemはOSの設定に追従する */
export type ThemeSetting = 'system' | 'light' | 'dark';

/** 実際に画面へ適用する配色。systemを解決した結果なので2値しかない */
export type ResolvedTheme = 'light' | 'dark';

export const DEFAULT_THEME_SETTING: ThemeSetting = 'system';

const THEME_SETTINGS: readonly ThemeSetting[] = ['system', 'light', 'dark'];

/** localStorageの値は信用できないため、読み込み時に必ず通す */
export function isThemeSetting(value: unknown): value is ThemeSetting {
  return typeof value === 'string' && THEME_SETTINGS.includes(value as ThemeSetting);
}

/** 設定とOSの状態から適用すべき配色を決める。テーマ機能の核心はこの1行 */
export function resolveTheme(
  setting: ThemeSetting,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (setting === 'system') return systemPrefersDark ? 'dark' : 'light';
  return setting;
}
