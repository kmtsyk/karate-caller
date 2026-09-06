import { useEffect, useMemo, useState } from 'react';
import { parseTechniques } from './domain/parser';
import type { Grade } from './domain/grade';
import { GRADES, GRADE_LABELS } from './domain/grade';
import { spokenTextOf, type Settings, type Technique } from './domain/technique';
import { useAutoPlayer } from './hooks/useAutoPlayer';
import { useTheme } from './hooks/useTheme';
import { useVoices } from './hooks/useVoices';
import { AutoPlaySection } from './components/AutoPlaySection';
import { GradeTabs } from './components/GradeTabs';
import { TapSection } from './components/TapSection';
import { TechniqueListEditor } from './components/TechniqueListEditor';
import { ThemeToggle } from './components/ThemeToggle';
import { VoiceSection } from './components/VoiceSection';
import { WebSpeechSpeaker } from './infrastructure/webSpeechSpeaker';
import { WebSpeechVoiceCatalog } from './infrastructure/webSpeechVoiceCatalog';
import { MediaQueryColorScheme } from './infrastructure/mediaQueryColorScheme';
import {
  defaultListOf,
  GradeRepository,
  LocalStorageStore,
  SettingsRepository,
  TechniqueListRepository,
  ThemeRepository,
} from './infrastructure/repositories';

// アプリで唯一の具象実装の組み立て箇所(合成ルート)。コンポーネントは抽象しか知らない
const store = new LocalStorageStore();
const listRepo = new TechniqueListRepository(store);
const settingsRepo = new SettingsRepository(store);
const themeRepo = new ThemeRepository(store);
const gradeRepo = new GradeRepository(store);
const speaker = new WebSpeechSpeaker();
const voiceCatalog = new WebSpeechVoiceCatalog();
const colorScheme = new MediaQueryColorScheme();

/** 試聴用の文。読み仮名を直接渡して誤読を避ける */
const PREVIEW_TEXT = 'じょうだんづき';

/** 級ごとのリストは切り替えても失わないよう、まとめて保持する */
type Lists = Record<Grade, string>;

function loadLists(): Lists {
  return Object.fromEntries(
    GRADES.map((grade) => [grade, listRepo.load(grade)]),
  ) as Lists;
}

export function App() {
  const [grade, setGrade] = useState<Grade>(() => gradeRepo.load());
  const [lists, setLists] = useState<Lists>(loadLists);
  const [settings, setSettings] = useState<Settings>(() => settingsRepo.load());

  const rawList = lists[grade];
  const techniques = useMemo(() => parseTechniques(rawList), [rawList]);
  const player = useAutoPlayer(speaker, techniques, settings);
  const theme = useTheme(themeRepo, colorScheme);
  const voices = useVoices(voiceCatalog);

  useEffect(() => {
    listRepo.save(grade, lists[grade]);
  }, [grade, lists]);

  useEffect(() => {
    gradeRepo.save(grade);
  }, [grade]);

  useEffect(() => {
    settingsRepo.save(settings);
  }, [settings]);

  // 音声設定はspeakのたびに参照されるので、変更を都度流し込む
  useEffect(() => {
    speaker.configure({
      voiceUri: settings.voiceUri,
      rate: settings.rate,
      pitch: settings.pitch,
    });
  }, [settings.voiceUri, settings.rate, settings.pitch]);

  const handleTap = (technique: Technique): void => {
    speaker.speak(spokenTextOf(technique));
  };

  // 級を切り替えたら読み上げは止める(別の級の技が続くと混乱するため)
  const handleGradeChange = (next: Grade): void => {
    player.stop();
    setGrade(next);
  };

  const handleListChange = (value: string): void => {
    setLists((prev) => ({ ...prev, [grade]: value }));
  };

  const gradeLabel = GRADE_LABELS[grade];

  return (
    <main>
      <header className="app-header">
        <h1>型読み上げアプリ</h1>
        <ThemeToggle theme={theme} />
      </header>

      <GradeTabs grade={grade} onChange={handleGradeChange} />

      {techniques.length === 0 && (
        <p className="empty-notice">
          {gradeLabel}の技名リストはまだ未設定です。下の「{gradeLabel}の技名リスト」に
          審査科目を貼り付けると、そのまま練習に使えます。
        </p>
      )}

      <AutoPlaySection player={player} settings={settings} onSettingsChange={setSettings} />
      <TapSection techniques={techniques} onTap={handleTap} />
      <VoiceSection
        voices={voices}
        settings={settings}
        onSettingsChange={setSettings}
        onPreview={() => speaker.speak(PREVIEW_TEXT)}
      />
      <TechniqueListEditor
        value={rawList}
        gradeLabel={gradeLabel}
        count={techniques.length}
        resettable={defaultListOf(grade).length > 0}
        onChange={handleListChange}
        onReset={() => handleListChange(defaultListOf(grade))}
      />
    </main>
  );
}
