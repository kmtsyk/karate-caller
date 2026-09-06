import type { Technique } from '../domain/technique';

interface Props {
  readonly techniques: readonly Technique[];
  onTap(technique: Technique): void;
}

export function TapSection({ techniques, onTap }: Props) {
  return (
    <section className="card">
      <h2>タップで読み上げ(二人で練習用)</h2>
      <div className="tap-grid">
        {techniques.map((technique) => (
          <button key={technique.name} onClick={() => onTap(technique)}>
            {technique.name}
          </button>
        ))}
      </div>
    </section>
  );
}