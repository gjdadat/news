import type { CredentialView, Settings } from '@shared/settings';
import { TOPIC_CATEGORIES } from '@shared/settings';
import { CredentialManager } from './CredentialManager';
import { KeywordInput } from './KeywordInput';

type Props = {
  settings: Settings;
  credentials: CredentialView[];
  onSettingsChange: (patch: Partial<Settings>) => void;
  onCredentialsChange: (credentials: CredentialView[]) => void;
  onClose: () => void;
};

export function SettingsScreen({
  settings,
  credentials,
  onSettingsChange,
  onCredentialsChange,
  onClose,
}: Props): React.JSX.Element {
  const usesLocalModel = credentials.some(
    (item) => item.providerKey === 'local' && item.enabled,
  );

  return (
    <div className="settings">
      <header className="header">
        <h1>설정</h1>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </header>

      <section className="panel">
        <h2>관심 주제</h2>
        <KeywordInput
          keywords={settings.topics.keywords}
          onChange={(keywords) => onSettingsChange({ topics: { ...settings.topics, keywords } })}
        />
        <div className="chips selectable">
          {TOPIC_CATEGORIES.map((category) => {
            const selected = settings.topics.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                className={selected ? 'selected' : ''}
                onClick={() =>
                  onSettingsChange({
                    topics: {
                      ...settings.topics,
                      categories: selected
                        ? settings.topics.categories.filter((item) => item !== category)
                        : [...settings.topics.categories, category],
                    },
                  })
                }
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>수집 범위</h2>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.sources.includeNews}
            onChange={(event) =>
              onSettingsChange({ sources: { ...settings.sources, includeNews: event.target.checked } })
            }
          />
          뉴스 기사
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.sources.includePapers}
            onChange={(event) =>
              onSettingsChange({ sources: { ...settings.sources, includePapers: event.target.checked } })
            }
          />
          논문
        </label>
      </section>

      <section className="panel">
        <h2>실행</h2>
        <label>
          자동 조사 시각
          <input
            type="number"
            min={0}
            max={23}
            value={settings.schedule.autoRunHour}
            onChange={(event) =>
              onSettingsChange({ schedule: { ...settings.schedule, autoRunHour: Number(event.target.value) } })
            }
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.schedule.startAtLogin}
            onChange={(event) =>
              onSettingsChange({ schedule: { ...settings.schedule, startAtLogin: event.target.checked } })
            }
          />
          컴퓨터를 켤 때 자동으로 시작 (끄면 아침 자동 조사가 동작하지 않습니다)
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.schedule.notify}
            onChange={(event) =>
              onSettingsChange({ schedule: { ...settings.schedule, notify: event.target.checked } })
            }
          />
          조사가 끝나면 알림 보내기
        </label>
      </section>

      <section className="panel">
        <h2>이미 본 기사</h2>
        <label>
          기억 기간
          <select
            value={settings.seen.retentionDays}
            onChange={(event) =>
              onSettingsChange({
                seen: { ...settings.seen, retentionDays: Number(event.target.value) as 7 | 30 | 90 },
              })
            }
          >
            <option value={7}>7일</option>
            <option value={30}>30일</option>
            <option value={90}>90일</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.seen.includeFollowUps}
            onChange={(event) =>
              onSettingsChange({ seen: { ...settings.seen, includeFollowUps: event.target.checked } })
            }
          />
          같은 사건의 후속 기사도 보기
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.seen.excludePapers}
            onChange={(event) =>
              onSettingsChange({ seen: { ...settings.seen, excludePapers: event.target.checked } })
            }
          />
          논문은 다시 보여주지 않기
        </label>
      </section>

      <section className="panel">
        <h2>요약·중요도 판단 (LLM)</h2>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.llm.prefetchSummaries}
            onChange={(event) =>
              onSettingsChange({ llm: { ...settings.llm, prefetchSummaries: event.target.checked } })
            }
          />
          아침에 상위 10개 요약을 미리 만들기
        </label>
        <p className="hint">
          {usesLocalModel
            ? '로컬 모델을 쓰고 있어 비용이 들지 않습니다. 켜 두는 편이 편리합니다.'
            : '켜면 하루 LLM 호출이 10회 늘어납니다. 무료 한도를 아끼려면 꺼 두세요.'}
        </p>
        <CredentialManager category="llm" credentials={credentials} onChange={onCredentialsChange} />
      </section>

      <section className="panel">
        <h2>뉴스</h2>
        <CredentialManager category="news" credentials={credentials} onChange={onCredentialsChange} />
      </section>

      <section className="panel">
        <h2>논문</h2>
        <CredentialManager category="paper" credentials={credentials} onChange={onCredentialsChange} />
      </section>

      <section className="panel">
        <h2>노션 아카이빙 (선택)</h2>
        <CredentialManager category="notion" credentials={credentials} onChange={onCredentialsChange} />
      </section>
    </div>
  );
}
