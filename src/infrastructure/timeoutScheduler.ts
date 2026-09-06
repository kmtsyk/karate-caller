import type { CancelFn, Scheduler } from '../application/ports';

export class TimeoutScheduler implements Scheduler {
  schedule(callback: () => void, delayMs: number): CancelFn {
    const id = setTimeout(callback, delayMs);
    return () => clearTimeout(id);
  }
}