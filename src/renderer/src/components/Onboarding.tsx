import { useState } from 'react';
import type { CredentialView, Settings } from '@shared/settings';
import { TOPIC_CATEGORIES } from '@shared/settings';
import { CredentialManager } from './CredentialManager';
import { KeywordInput } from './KeywordInput';

type Props = {
  settings: Settings;
  credentials: CredentialView[];
  onCredentialsChange: (credentials: CredentialView[]) => void;
  onFinish: (patch: Partial<Settings>) => void;
};

const STEPS = ['관심 주제', '수집 범위', 'API 키', '노션 연결'];

export function Onboarding({
  settings,
  credentials,
  onCredentialsChange,
  onFinish,
}: Props): React.JSX.Element {
  const [step, setStep] = useState(0);
  // 마법사는 자기가 편집하는 항목만 들고 있는다. 설정 전체를 스냅샷으로 들면
  // 마법사를 도는 동안 3단계에서 추가한 자격증명을 마지막에 덮어쓰게 된다.
  const [draft, setDraft] = useState({ topics: settings.topics, sources: settings.sources });

  const patch = (change: Partial<typeof draft>): void => setDraft({ ...draft, ...change });
  const hasTopic = draft.topics.keywords.length > 0 || draft.topics.categories.length > 0;

  return (
    <div className="onboarding">
      <header className="header">
        <div>
          <h1>처음 설정</h1>
          <p className="date">
            {step + 1} / {STEPS.length} · {STEPS[step]}
          </p>
        </div>
      </header>

      <ol className="steps">
        {STEPS.map((label, index) => (
          <li key={label} className={index === step ? 'current' : index < step ? 'done' : ''}>
            {label}
          </li>
        ))}
      </ol>

      <section className="panel">
        {step === 0 && (
          <>
            <h2>어떤 주제를 받아볼까요?</h2>
            <p className="hint">키워드를 직접 넣거나 분야를 골라 주세요. 둘 다 써도 됩니다.</p>
            <KeywordInput
              keywords={draft.topics.keywords}
              onChange={(keywords) => patch({ topics: { ...draft.topics, keywords } })}
            />
            <div className="chips selectable">
              {TOPIC_CATEGORIES.map((category) => {
                const selected = draft.topics.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={selected ? 'selected' : ''}
                    onClick={() =>
                      patch({
                        topics: {
                          ...draft.topics,
                          categories: selected
                            ? draft.topics.categories.filter((item) => item !== category)
                            : [...draft.topics.categories, category],
                        },
                      })
                    }
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>무엇을 모을까요?</h2>
            <p className="hint">여기서 정한 값이 앞으로의 기본 설정이 됩니다. 나중에 바꿀 수 있습니다.</p>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.sources.includeNews}
                onChange={(event) => patch({ sources: { ...draft.sources, includeNews: event.target.checked } })}
              />
              뉴스 기사
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.sources.includePapers}
                onChange={(event) => patch({ sources: { ...draft.sources, includePapers: event.target.checked } })}
              />
              논문 (arXiv, OpenAlex 등 — 키가 필요 없습니다)
            </label>
            <label>
              뉴스는 최근 몇 시간까지 볼까요?
              <input
                type="number"
                min={6}
                max={168}
                value={draft.sources.newsWindowHours}
                onChange={(event) =>
                  patch({ sources: { ...draft.sources, newsWindowHours: Number(event.target.value) } })
                }
              />
            </label>
            <label>
              논문은 최근 며칠까지 볼까요?
              <input
                type="number"
                min={1}
                max={90}
                value={draft.sources.paperWindowDays}
                onChange={(event) =>
                  patch({ sources: { ...draft.sources, paperWindowDays: Number(event.target.value) } })
                }
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h2>어떤 서비스를 쓸까요?</h2>
            <p className="hint">
              전부 건너뛰어도 됩니다. arXiv·OpenAlex·RSS는 키 없이 동작합니다. 여기에 로컬 모델까지 찾아지면 키
              하나 없이 요약과 중요도 판단까지 됩니다.
            </p>
            <h3>요약·중요도 판단 (LLM)</h3>
            <CredentialManager category="llm" credentials={credentials} onChange={onCredentialsChange} />
            <h3>뉴스</h3>
            <CredentialManager category="news" credentials={credentials} onChange={onCredentialsChange} />
            <h3>논문</h3>
            <CredentialManager category="paper" credentials={credentials} onChange={onCredentialsChange} />
          </>
        )}

        {step === 3 && (
          <>
            <h2>노션에 보관할까요? (선택)</h2>
            <p className="hint">
              연결하지 않으면 앱에서 노션 관련 기능이 아예 보이지 않습니다. 나중에 설정에서 연결해도 됩니다.
            </p>
            <ol className="guide">
              <li>
                노션 통합 페이지에서 새 통합(Integration)을 만듭니다.{' '}
                <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer">
                  통합 페이지 열기
                </a>
              </li>
              <li>발급된 시크릿을 복사해 아래에 붙여 넣고 [연결 테스트]를 누릅니다.</li>
              <li>
                기사를 모아 둘 노션 페이지를 열어 방금 만든 통합에 <strong>연결 권한</strong>을 줍니다. 이 단계를
                빠뜨리면 앱이 페이지를 볼 수 없습니다.
              </li>
            </ol>
            <CredentialManager category="notion" credentials={credentials} onChange={onCredentialsChange} />
            <p className="hint">토큰을 저장해 두면 다음 단계인 저장 위치 선택을 이어서 할 수 있습니다.</p>
          </>
        )}
      </section>

      <footer className="wizard-actions">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)}>
            이전
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="primary"
            disabled={step === 0 && !hasTopic}
            onClick={() => setStep(step + 1)}
          >
            {step >= 2 ? '건너뛰고 다음' : '다음'}
          </button>
        ) : (
          <button type="button" className="primary" onClick={() => onFinish({ ...draft, onboardingCompleted: true })}>
            설정 마치기
          </button>
        )}
      </footer>
    </div>
  );
}
