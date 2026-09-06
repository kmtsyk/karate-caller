import { useEffect, useRef, useState } from 'react';
import type { Settings, Technique } from '../domain/technique';
import type { Picker } from '../domain/picker';
import { OrderModePicker, SequentialPicker } from '../domain/picker';
import { ShuffleBag } from '../domain/shuffleBag';
import { AutoPlayer } from '../application/autoPlayer';
import type { Speaker } from '../application/ports';
import { TimeoutScheduler } from '../infrastructure/timeoutScheduler';

export interface AutoPlayerState {
  readonly isRunning: boolean;
  readonly current: Technique | null;
  /** 読み上げから一定時間後にtrueになり、答え(文字)を表示してよい状態を表す */
  readonly isRevealed: boolean;
  /** 現在の待ち時間(秒)。カウントダウンの分母 */
  readonly nextWaitSec: number | null;
  /** 次の読み上げまでの残り秒数。1秒ごとに減る */
  readonly remainingSec: number | null;
  toggle(): void;
  stop(): void;
}

/** カウントダウンの更新間隔。1000msだと表示が1秒飛ぶことがあるので細かく刻む */
const COUNTDOWN_TICK_MS = 200;

/**
 * 命令的なAutoPlayer(タイマー駆動)をReactの宣言的な世界に接続するフック。
 * - 最新のprops(techniques/settings)はrefで橋渡しし、コールバックの陳腐化を防ぐ
 * - アンマウント時に音声・タイマーを確実に停止する
 */
export function useAutoPlayer(
  speaker: Speaker,
  techniques: readonly Technique[],
  settings: Settings,
  revealDelayMs = 1000,
): AutoPlayerState {
  const [isRunning, setIsRunning] = useState(false);
  const [current, setCurrent] = useState<Technique | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [nextWaitSec, setNextWaitSec] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  /** 読み上げごとに増える通し番号。同じ待ち秒数が続いてもカウントダウンを張り替えるため */
  const [spokenSeq, setSpokenSeq] = useState(0);

  const techniquesRef = useRef(techniques);
  const settingsRef = useRef(settings);

  // 最新のpropsをrefへ橋渡しする。AutoPlayerが読むのはタイマー発火時(=コミット後)なので、
  // レンダー中に書かずeffectで同期すれば十分
  useEffect(() => {
    techniquesRef.current = techniques;
    settingsRef.current = settings;
  }, [techniques, settings]);

  const pickerRef = useRef<Picker<Technique> | null>(null);
  const playerRef = useRef<AutoPlayer | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // マウント時に1度だけ組み立てる。
  // レンダー中に作るとrefへの読み書きがレンダーの副作用になるため、effectに寄せている
  useEffect(() => {
    const source = (): readonly Technique[] => techniquesRef.current;
    const picker = new OrderModePicker<Technique>(
      () => settingsRef.current.order,
      new ShuffleBag<Technique>(source),
      new SequentialPicker<Technique>(source),
    );
    const player = new AutoPlayer(
      speaker,
      new TimeoutScheduler(),
      picker,
      () => settingsRef.current,
      {
        onSpoken: (technique, waitSec) => {
          setCurrent(technique);
          setIsRevealed(false);
          setNextWaitSec(waitSec);
          setRemainingSec(waitSec);
          if (revealTimerRef.current !== null) clearTimeout(revealTimerRef.current);
          revealTimerRef.current = setTimeout(() => setIsRevealed(true), revealDelayMs);
          setSpokenSeq((seq) => seq + 1);
        },
        onStopped: () => {
          setIsRunning(false);
          setNextWaitSec(null);
          setRemainingSec(null);
        },
      },
    );
    pickerRef.current = picker;
    playerRef.current = player;

    // アンマウント時のクリーンアップ(音声・タイマーのリーク防止)
    return () => {
      player.stop();
      if (revealTimerRef.current !== null) clearTimeout(revealTimerRef.current);
      pickerRef.current = null;
      playerRef.current = null;
    };
  }, [speaker, revealDelayMs]);

  // 読み上げごとにカウントダウンを張り直す。
  // 残り秒は毎回「締切 - 現在時刻」から計算するので、tickの誤差が蓄積しない
  useEffect(() => {
    if (nextWaitSec === null) return;

    // 初期値(=waitSec)はonSpokenが入れている。ここは減算だけを担当する
    const deadline = Date.now() + nextWaitSec * 1000;

    const id = setInterval(() => {
      setRemainingSec(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [nextWaitSec, spokenSeq]);

  // リストが編集されたら進行中の巡回を破棄する
  useEffect(() => {
    pickerRef.current?.invalidate();
  }, [techniques]);

  const toggle = (): void => {
    const player = playerRef.current;
    if (player === null) return;
    if (player.isRunning) {
      player.stop();
    } else if (techniquesRef.current.length > 0) {
      setIsRunning(true);
      player.start();
    }
  };

  const stop = (): void => {
    playerRef.current?.stop();
  };

  return { isRunning, current, isRevealed, nextWaitSec, remainingSec, toggle, stop };
}