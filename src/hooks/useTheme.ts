import { useEffect, useState } from 'react';
import type { ColorSchemeSource } from '../application/ports';
import type { ResolvedTheme, ThemeSetting } from '../domain/theme';
import { resolveTheme } from '../domain/theme';
import type { ThemeRepository } from '../infrastructure/repositories';

export interface ThemeState {
  /** ユーザーの選択(system含む) */
  readonly setting: ThemeSetting;
  /** 実際に適用されている配色 */
  readonly resolved: ResolvedTheme;
  setSetting(setting: ThemeSetting): void;
}

/**
 * テーマ設定の永続化・OS追従・DOMへの反映をまとめたフック。
 * CSSは<html data-theme>だけを見ればよく、コンポーネント側は色を意識しない。
 */
export function useTheme(repo: ThemeRepository, colorScheme: ColorSchemeSource): ThemeState {
  const [setting, setSetting] = useState<ThemeSetting>(() => repo.load());
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    colorScheme.prefersDark(),
  );

  // system選択中にOS側で切り替わったら即追従する
  useEffect(() => colorScheme.subscribe(setSystemPrefersDark), [colorScheme]);

  const resolved = resolveTheme(setting, systemPrefersDark);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    // モバイルのアドレスバーの色も合わせる。値はCSSの--bgから読み、色定義の二重管理を避ける
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta !== null) {
      meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
    }
  }, [resolved]);

  useEffect(() => {
    repo.save(setting);
  }, [repo, setting]);

  return { setting, resolved, setSetting };
}
