import { useState } from 'react';

type Props = {
  keywords: string[];
  onChange: (keywords: string[]) => void;
};

export function KeywordInput({ keywords, onChange }: Props): React.JSX.Element {
  const [draft, setDraft] = useState('');

  const add = (): void => {
    const value = draft.trim();
    if (!value || keywords.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...keywords, value]);
    setDraft('');
  };

  return (
    <div className="keyword-input">
      <div className="row">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
          placeholder="예: AI 반도체"
          aria-label="관심 키워드"
        />
        <button type="button" onClick={add}>
          추가
        </button>
      </div>
      {keywords.length > 0 && (
        <ul className="chips">
          {keywords.map((keyword) => (
            <li key={keyword}>
              <span>{keyword}</span>
              <button
                type="button"
                aria-label={`${keyword} 삭제`}
                onClick={() => onChange(keywords.filter((item) => item !== keyword))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
