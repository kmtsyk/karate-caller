import { defaultListOf } from '../data/defaultLists';
import type { Grade } from '../domain/grade';
import { DEFAULT_GRADE, isGrade } from '../domain/grade';
import type { Settings } from '../domain/technique';
import { DEFAULT_SETTINGS } from '../domain/technique';
import type { ThemeSetting } from '../domain/theme';
import { DEFAULT_THEME_SETTING, isThemeSetting } from '../domain/theme';

/** ストレージの抽象。テストではMap実装を注入する */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export class LocalStorageStore implements KeyValueStore {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}

export class TechniqueListRepository {
  /** 級ごとに分ける前の単一キー。既存端末の編集内容を4級として引き継ぐために見る */
  private static readonly LEGACY_KEY = 'karateCaller:list';
  private readonly store: KeyValueStore;
  constructor(store: KeyValueStore) {
    this.store = store;
  }

  load(grade: Grade): string {
    const raw = this.store.get(keyOf(grade));
    // 空・空白のみの保存値は「未設定」扱い。空文字列だとnull合体が効かず永久に空のままになる
    if (raw !== null && raw.trim().length > 0) return raw;

    if (grade === 'kyu4') {
      const legacy = this.store.get(TechniqueListRepository.LEGACY_KEY);
      if (legacy !== null && legacy.trim().length > 0) return legacy;
    }
    return defaultListOf(grade);
  }
  save(grade: Grade, raw: string): void {
    this.store.set(keyOf(grade), raw);
  }
}

function keyOf(grade: Grade): string {
  return `karateCaller:list:${grade}`;
}

export class GradeRepository {
  private static readonly KEY = 'karateCaller:grade';
  private readonly store: KeyValueStore;
  constructor(store: KeyValueStore) {
    this.store = store;
  }

  load(): Grade {
    const raw = this.store.get(GradeRepository.KEY);
    return isGrade(raw) ? raw : DEFAULT_GRADE;
  }
  save(grade: Grade): void {
    this.store.set(GradeRepository.KEY, grade);
  }
}

export class SettingsRepository {
  private static readonly KEY = 'karateCaller:settings';
  private readonly store: KeyValueStore;
  constructor(store: KeyValueStore) {
    this.store = store;
  }

  load(): Settings {
    try {
      const raw = this.store.get(SettingsRepository.KEY);
      if (raw === null) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  save(settings: Settings): void {
    this.store.set(SettingsRepository.KEY, JSON.stringify(settings));
  }
}

export class ThemeRepository {
  /** index.htmlのFOUC防止スクリプトが同じキーを直読みしている。変更時は両方直すこと */
  private static readonly KEY = 'karateCaller:theme';
  private readonly store: KeyValueStore;
  constructor(store: KeyValueStore) {
    this.store = store;
  }

  load(): ThemeSetting {
    const raw = this.store.get(ThemeRepository.KEY);
    return isThemeSetting(raw) ? raw : DEFAULT_THEME_SETTING;
  }
  save(setting: ThemeSetting): void {
    this.store.set(ThemeRepository.KEY, setting);
  }
}