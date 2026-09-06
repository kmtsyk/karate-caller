import type { OrderMode } from './technique';

/** 次に読み上げる要素を決める抽象。実装: ShuffleBag / SequentialPicker */
export interface Picker<T> {
  next(): T | undefined;
  /** リスト編集時に呼び、進行中の巡回を破棄する */
  invalidate(): void;
}

/** 先頭から順に1つずつ返し、末尾まで行ったら先頭へ戻る */
export class SequentialPicker<T> implements Picker<T> {
  private index = 0;
  private readonly source: () => readonly T[];

  constructor(source: () => readonly T[]) {
    this.source = source;
  }

  next(): T | undefined {
    const items = this.source();
    if (items.length === 0) return undefined;
    // リストが短くなっていても範囲外を返さないよう毎回丸める
    if (this.index >= items.length) this.index = 0;
    const item = items[this.index];
    this.index = (this.index + 1) % items.length;
    return item;
  }

  invalidate(): void {
    this.index = 0;
  }
}

/** 設定に応じて実装を切り替えるPicker。切り替えは読み上げのたびに評価される */
export class OrderModePicker<T> implements Picker<T> {
  private readonly getOrder: () => OrderMode;
  private readonly random: Picker<T>;
  private readonly sequential: Picker<T>;

  constructor(getOrder: () => OrderMode, random: Picker<T>, sequential: Picker<T>) {
    this.getOrder = getOrder;
    this.random = random;
    this.sequential = sequential;
  }

  next(): T | undefined {
    return this.getOrder() === 'sequential' ? this.sequential.next() : this.random.next();
  }

  invalidate(): void {
    this.random.invalidate();
    this.sequential.invalidate();
  }
}
