import { useEffect, useSyncExternalStore } from 'react';
import type { VoiceCatalog, VoiceOption } from '../application/ports';

/** 端末の音声一覧を購読する。遅延ロードが完了したら自動で再描画される */
export function useVoices(catalog: VoiceCatalog): readonly VoiceOption[] {
  const voices = useSyncExternalStore(
    (onStoreChange) => catalog.subscribe(onStoreChange),
    () => catalog.list(),
  );

  // voiceschangedを発火しない端末向けに、マウント後にも一度取り直す
  useEffect(() => {
    catalog.refresh();
  }, [catalog]);

  return voices;
}
