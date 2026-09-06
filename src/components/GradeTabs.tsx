import type { Grade } from '../domain/grade';
import { GRADES, GRADE_LABELS } from '../domain/grade';

interface Props {
  readonly grade: Grade;
  onChange(grade: Grade): void;
}

export function GradeTabs({ grade, onChange }: Props) {
  return (
    <nav className="segmented grade-tabs" aria-label="審査級の切り替え">
      {GRADES.map((candidate) => (
        <button
          key={candidate}
          type="button"
          className="segmented-button"
          aria-pressed={grade === candidate}
          onClick={() => onChange(candidate)}
        >
          {GRADE_LABELS[candidate]}
        </button>
      ))}
    </nav>
  );
}
