import { useEffect, useMemo, useState } from 'react';
import { parseTechniques } from './domain/parser';
import { spokenTextOf, type Settings, type Technique } from './domain/technique';
import { useAutoPlayer } from './hooks/useAutoPlayer';
import { useTheme } from './hooks/useTheme';
import { useVoices } from './hooks/useVoices';
import { AutoPlaySection } from './components/AutoPlaySection';
import { TapSection } from './components/TapSection';
import { TechniqueListEditor } from './components/TechniqueListEditor';
import { ThemeToggle } from './components/ThemeToggle';
import { VoiceSection } from './components/VoiceSection';
import { WebSpeechSpeaker } from './infrastructure/webSpeechSpeaker';
import { WebSpeechVoiceCatalog } from './infrastructure/webSpeechVoiceCatalog';
import { MediaQueryColorScheme } from './infrastructure/mediaQueryColorScheme';
import {
  DEFAULT_LIST,
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
const speaker = new WebSpeechSpeaker();
const voiceCatalog = new WebSpeechVoiceCatalog();
const colorScheme = new MediaQueryColorScheme();

/** 試聴用の文。読み仮名を直接渡して誤読を避ける */
const PREVIEW_TEXT = 'じょうだんづき';

export function App() {
  const [rawList, setRawList] = useState(() => listRepo.load());
  const [settings, setSettings] = useState<Settings>(() => settingsRepo.load());

  const techniques = useMemo(() => parseTechniques(rawList), [rawList]);
  const player = useAutoPlayer(speaker, techniques, settings);
  const theme = useTheme(themeRepo, colorScheme);
  const voices = useVoices(voiceCatalog);

  useEffect(() => {
    listRepo.save(rawList);
  }, [rawList]);

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

  return (
    <main>
      <header className="app-header">
        <h1>型読み上げアプリ</h1>
        <ThemeToggle theme={theme} />
      </header>
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
        count={techniques.length}
        onChange={setRawList}
        onReset={() => setRawList(DEFAULT_LIST)}
      />
    </main>
  );
}