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

export const DEFAULT_LIST = [
  // 突き・打ち
  '上段突き,じょうだんづき',
  '中段突き,ちゅうだんづき',
  '直突き,ちょくづき',
  '上段廻し打ち,じょうだんまわしうち',
  '中段廻し打ち,ちゅうだんまわしうち',
  '下突き,したづき',
  '顎打ち(鉤突き),あごうち',
  '鎖骨打ち,さこつうち',
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

export class TechniqueListRepository {
  private static readonly KEY = 'karateCaller:list';
  constructor(private readonly store: KeyValueStore) {}

  load(): string {
    const raw = this.store.get(TechniqueListRepository.KEY);
    // 空・空白のみの保存値は「未設定」扱い。空文字列だとnull合体が効かず永久に空のままになる
    if (raw === null || raw.trim().length === 0) return DEFAULT_LIST;
    return raw;
  }
  save(raw: string): void {
    this.store.set(TechniqueListRepository.KEY, raw);
  }
}

export class SettingsRepository {
  private static readonly KEY = 'karateCaller:settings';
  constructor(private readonly store: KeyValueStore) {}

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
  constructor(private readonly store: KeyValueStore) {}

  load(): ThemeSetting {
    const raw = this.store.get(ThemeRepository.KEY);
    return isThemeSetting(raw) ? raw : DEFAULT_THEME_SETTING;
  }
  save(setting: ThemeSetting): void {
    this.store.set(ThemeRepository.KEY, setting);
  }
}