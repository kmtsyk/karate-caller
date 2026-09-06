import type { Settings, Technique } from '../domain/technique';
import { spokenTextOf } from '../domain/technique';
import { resolveIntervalSec } from '../domain/interval';
import type { ShuffleBag } from '../domain/shuffleBag';
import type { CancelFn, Scheduler, Speaker } from './ports';

export interface AutoPlayerListener {
  onSpoken(technique: Technique, nextWaitSec: number): void;
  onStopped(): void;
}

/** メニュー1(自動ランダム読み上げ)のユースケース。ブラウザAPIもReactも一切知らない */
export class AutoPlayer {
  private cancelNext: CancelFn | null = null;
  private running = false;

  private readonly speaker: Speaker;
  private readonly scheduler: Scheduler;
  private readonly bag: ShuffleBag<Technique>;
  private readonly getSettings: () => Settings;
  private readonly listener: AutoPlayerListener;

  constructor(
    speaker: Speaker,
    scheduler: Scheduler,
    bag: ShuffleBag<Technique>,
    getSettings: () => Settings,
    listener: AutoPlayerListener,
  ) {
    this.speaker = speaker;
    this.scheduler = scheduler;
    this.bag = bag;
    this.getSettings = getSettings;
    this.listener = listener;
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    this.cancelNext?.();
    this.cancelNext = null;
    this.speaker.stop();
    this.listener.onStopped();
  }

  private tick(): void {
    const technique = this.bag.next();
    if (technique === undefined) {
      this.stop();
      return;
    }
    this.speaker.speak(spokenTextOf(technique));

    const waitSec = resolveIntervalSec(technique, this.getSettings());
    this.listener.onSpoken(technique, waitSec);

    this.cancelNext = this.scheduler.schedule(() => {
      if (this.running) this.tick();
    }, waitSec * 1000);
  }
}