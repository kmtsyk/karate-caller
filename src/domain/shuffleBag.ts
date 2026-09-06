/**
 * 全要素を1巡するまで重複させない抽選器(Fisher–Yates)。
 * 乱数源を注入可能にし、テストで抽選順を固定できるようにしている。
 */
export class ShuffleBag<T> {
  private bag: T[] = [];
  private readonly source: () => readonly T[];
  private readonly random: () => number;

  constructor(source: () => readonly T[], random: () => number = Math.random) {
    this.source = source;
    this.random = random;
  }

  next(): T | undefined {
    if (this.bag.length === 0) this.refill();
    return this.bag.pop();
  }

  /** リスト編集時に呼び、進行中の巡回を破棄する */
  invalidate(): void {
    this.bag = [];
  }

  private refill(): void {
    this.bag = [...this.source()];
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }
}
// 関数で書くなら...
// function createPicker<T>(
//   source: () => readonly T[],
//   random: () => number = Math.random,
// ) {
//   return {
//     pick() {
//       const items = source();
//       return items[Math.floor(random() * items.length)];
//     },
//   };
// }