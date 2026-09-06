import type { Settings, Technique } from './technique';

/** 間隔決定ポリシー: perTechniqueモードで個別値があれば優先、なければ一律値 */
export function resolveIntervalSec(technique: Technique, settings: Settings): number {
  if (settings.mode === 'perTechnique' && technique.intervalSec !== null) {
    return technique.intervalSec;
  }
  return settings.uniformIntervalSec;
}