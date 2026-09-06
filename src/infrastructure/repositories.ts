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

const KYU4_LIST = [
  // 突き・打ち
  '正拳上段突き,せいけんじょうだんづき',
  '正拳中段突き,せいけんちゅうだんづき',
  '正拳直突き,せいけんちょくづき',
  '正拳上段廻し打ち,せいけんじょうだんまわしうち',
  '正拳中段廻し打ち,せいけんちゅうだんまわしうち',
  '正拳下突き,せいけんしたづき',
  '正拳顎打ち(鉤突き),せいけんあごうち',
  '正拳鎖骨打ち,せいけんさこつうち',
  // 裏拳
  '裏拳正面打ち,うらけんしょうめんうち',
  '裏拳左右打ち,うらけんさゆううち',
  '裏拳脾臓打ち,うらけんひぞううち',
  '裏拳下突き,うらけんしたづき',
  '裏手打ち(目打ち),うらてうち',
  '手刀顔面打ち(手刀回し打ち),しゅとうがんめんうち',
  '手刀鎖骨打ち,しゅとうさこつうち',
  '手刀脾臓打ち,しゅとうひぞううち',
  '手刀内打ち,しゅとううちうち',
  '手刀鎖骨打ち込み,しゅとうさこつうちこみ',
  '手刀切り,しゅとうぎり',
  // 蹴り
  '中段前蹴り,ちゅうだんまえげり',
  '上段前蹴り,じょうだんまえげり',
  '三日月蹴り,みかづきげり',
  '返し蹴り,かえしげり',
  '足刀蹴り,そくとうげり',
  '廻蹴り,まわしげり',
  '金的蹴り,きんてきげり',
  '後ろ廻蹴り,うしろまわしげり',
  // 受け
  '上受け,うわうけ',
  '内受け,うちうけ',
  '下受け,したうけ',
  '払受け,はらいうけ',
  '外受け,そとうけ',
  '打上げ受け,うちあげうけ',
  '十字受け,じゅうじうけ',
  // 構え
  '正面基本立ち構え(白蓮中段構え),しょうめんきほんだちかまえ',
  '左組み手構え(組手立ち),ひだりくみてがまえ',
  '右組み手構え(組手立ち),みぎくみてがまえ',
  '一字構え,いちじがまえ',
  '下段構え,げだんがまえ',
  '八相構え,はっそうがまえ',
  '待気構え,たいきがまえ',
  '乱れ構え,みだれがまえ',
  '伏虎構え,ふっこがまえ',
  '結手構え(結立ち),けっしゅがまえ',
  // 移動・転身
  '横転身,よこてんしん',
  '半転身,はんてんしん',
  '逆転身,ぎゃくてんしん',
  '前後移動,ぜんごいどう',
  '順退り,じゅんさがり',
  '開き退り,ひらきさがり',
  '差し変え足(後ろ足を前),さしかえあし',
  '全転換,ぜんてんかん',
  '右半転換,みぎはんてんかん',
  '左半転換,ひだりはんてんかん',
  '右横転身,みぎよこてんしん',
  '左横転身,ひだりよこてんしん',
  // 受身
  '左前受身,ひだりまえうけみ',
  '右前受身,みぎまえうけみ',
  '左後受身,ひだりうしろうけみ',
  '右後受身,みぎうしろうけみ',
].join('\n');

/**
 * 級ごとの初期リスト。
 * 4級は本人から受け取った審査科目。3〜1級は内容が未確認なので空にしてある
 * (推測で埋めると練習内容そのものが間違うため、アプリ内で貼り付けてもらう)。
 */
const DEFAULT_LISTS: Record<Grade, string> = {
  kyu4: KYU4_LIST,
  kyu3: '',
  kyu2: '',
  kyu1: '',
};

export function defaultListOf(grade: Grade): string {
  return DEFAULT_LISTS[grade];
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
    return DEFAULT_LISTS[grade];
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