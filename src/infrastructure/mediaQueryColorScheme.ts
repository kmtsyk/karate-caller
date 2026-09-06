import type { CancelFn, ColorSchemeSource } from '../application/ports';

const QUERY = '(prefers-color-scheme: dark)';

export class MediaQueryColorScheme implements ColorSchemeSource {
  prefersDark(): boolean {
    return window.matchMedia(QUERY).matches;
  }

  subscribe(listener: (prefersDark: boolean) => void): CancelFn {
    const mql = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent): void => listener(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }
}
