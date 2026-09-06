interface Props {
  readonly value: string;
  /** 編集対象の級。どのリストを触っているかを明示する */
  readonly gradeLabel: string;
  /** パース後の件数。編集内容が実際に何件として認識されたかを見せる */
  readonly count: number;
  /** 初期リストを持つ級かどうか(未設定の級ではリセットボタンを出さない) */
  readonly resettable: boolean;
  onChange(value: string): void;
  onReset(): void;
}

export function TechniqueListEditor({
  value,
  gradeLabel,
  count,
  resettable,
  onChange,
  onReset,
}: Props) {
  const handleReset = (): void => {
    // 保存済みの編集内容を捨てる操作なので明示的に確認する
    if (window.confirm('編集中のリストを破棄して初期リストに戻しますか?')) onReset();
  };

  return (
    <section className="card">
      <h2>
        {gradeLabel}の技名リスト(「表示名,読み,秒数」・読みと秒数は省略可)
      </h2>
      <textarea rows={14} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="editor-footer">
        <span className="value-badge">{count}件</span>
        {resettable && (
          <button type="button" className="text-button" onClick={handleReset}>
            初期リストに戻す
          </button>
        )}
      </div>
    </section>
  );
}
