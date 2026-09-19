import { useState } from 'react';
import type { LocalRunner, MutationResult } from '@shared/ipc';
import { PRICING_LABEL, providersOf, findProvider } from '@shared/providers';
import type { CredentialStatus, CredentialView, ProviderCategory } from '@shared/settings';

const STATUS_LABEL: Record<CredentialStatus, string> = {
  ok: '연결됨',
  auth_error: '키 오류',
  rate_limited: '한도 초과',
  server_error: '서버 오류',
  unreachable: '연결 실패',
  unknown: '확인 필요',
};

type Props = {
  category: ProviderCategory;
  credentials: CredentialView[];
  onChange: (credentials: CredentialView[]) => void;
};

export function CredentialManager({ category, credentials, onChange }: Props): React.JSX.Element {
  const specs = providersOf(category);
  const [providerKey, setProviderKey] = useState(specs[0]?.key ?? '');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runners, setRunners] = useState<LocalRunner[] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 실패를 조용히 넘기면 사용자는 버튼이 고장난 줄 안다. 사유를 항상 띄운다. */
  const apply = async (action: () => Promise<MutationResult>): Promise<void> => {
    try {
      const result = await action();
      onChange(result.credentials);
      setError(result.error ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '알 수 없는 오류가 발생했습니다');
    }
  };

  const spec = findProvider(providerKey);
  const mine = credentials.filter((item) => item.category === category);

  const setField = (key: string, value: string): void =>
    setFields((previous) => ({ ...previous, [key]: value }));

  const add = async (): Promise<void> => {
    if (!spec) return;
    const secrets: Record<string, string> = {};
    for (const field of spec.secretFields) {
      const value = fields[field.key]?.trim();
      if (value) secrets[field.key] = value;
    }
    const options: Record<string, string> = {};
    for (const field of spec.optionFields ?? []) {
      const value = fields[field.key]?.trim();
      if (value) options[field.key] = value;
    }
    await apply(() =>
      window.news.addCredential({
        category,
        providerKey: spec.key,
        label: spec.label,
        secrets,
        options,
      }),
    );
    setFields({});
  };

  const detect = async (): Promise<void> => {
    setDetecting(true);
    try {
      setRunners(await window.news.detectLocalModels());
    } finally {
      setDetecting(false);
    }
  };

  const useRunner = (runner: LocalRunner, model: string): Promise<void> =>
    apply(() =>
      window.news.addCredential({
        category: 'llm',
        providerKey: 'local',
        label: `${runner.runner} · ${model}`,
        secrets: {},
        options: { baseUrl: runner.baseUrl, model },
      }),
    );

  const run = async (id: string, action: () => Promise<MutationResult>): Promise<void> => {
    setBusyId(id);
    try {
      await apply(action);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="credentials">
      {error && <p className="banner warn">{error}</p>}
      {category === 'llm' && (
        <div className="local-detect">
          <button type="button" onClick={detect} disabled={detecting}>
            {detecting ? '찾는 중…' : '내 컴퓨터에서 모델 찾기'}
          </button>
          <p className="hint">
            Qwen 같은 모델이 설치돼 있으면 비용 없이 쓸 수 있습니다. 찾은 모델은 1순위로 두는 것을 권합니다.
          </p>
          {runners?.length === 0 && (
            <p className="hint warn">
              실행 중인 로컬 모델을 찾지 못했습니다. Ollama나 LM Studio를 켜고 다시 시도해 주세요.
            </p>
          )}
          {runners?.map((runner) => (
            <div key={runner.baseUrl} className="runner">
              <strong>{runner.runner}</strong> <span className="hint">{runner.baseUrl}</span>
              <ul>
                {runner.models.map((model) => (
                  <li key={model}>
                    <span>{model}</span>
                    <button type="button" onClick={() => void useRunner(runner, model)}>
                      사용
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {mine.length > 0 && (
        <ol className="credential-list">
          {mine.map((item, index) => {
            const itemSpec = findProvider(item.providerKey);
            return (
              <li key={item.id} className={item.enabled ? '' : 'disabled'}>
                <div className="credential-head">
                  <span className="order">{index + 1}</span>
                  <div className="credential-title">
                    <strong>{item.label}</strong>
                    {itemSpec && <span className={`badge ${itemSpec.pricing}`}>{PRICING_LABEL[itemSpec.pricing]}</span>}
                    {item.lastStatus && (
                      <span className={`status ${item.lastStatus}`}>{STATUS_LABEL[item.lastStatus]}</span>
                    )}
                  </div>
                </div>
                <div className="credential-meta">
                  {item.maskedSecret && <code>{item.maskedSecret}</code>}
                  {item.options['baseUrl'] && <code>{item.options['baseUrl']}</code>}
                  {item.options['model'] && <code>{item.options['model']}</code>}
                  {item.lastMessage && <span className="hint">{item.lastMessage}</span>}
                </div>
                <div className="credential-actions">
                  <button
                    type="button"
                    aria-label="순서 올리기"
                    disabled={index === 0 || busyId === item.id}
                    onClick={() => void run(item.id, () => window.news.moveCredential(item.id, -1))}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label="순서 내리기"
                    disabled={index === mine.length - 1 || busyId === item.id}
                    onClick={() => void run(item.id, () => window.news.moveCredential(item.id, 1))}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void run(item.id, () => window.news.testCredential(item.id))}
                  >
                    {busyId === item.id ? '확인 중…' : '연결 테스트'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void run(item.id, () => window.news.setCredentialEnabled(item.id, !item.enabled))}
                  >
                    {item.enabled ? '사용 안 함' : '사용'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    disabled={busyId === item.id}
                    onClick={() => void run(item.id, () => window.news.removeCredential(item.id))}
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="credential-form">
        <label>
          제공사
          <select value={providerKey} onChange={(event) => setProviderKey(event.target.value)}>
            {specs.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label} · {PRICING_LABEL[item.pricing]}
              </option>
            ))}
          </select>
        </label>

        {spec?.note && <p className="hint">{spec.note}</p>}
        {spec?.pricing === 'paid' && (
          <p className="hint warn">이 제공사는 유료입니다. 사용량만큼 요금이 청구됩니다.</p>
        )}

        {[...(spec?.secretFields ?? []), ...(spec?.optionFields ?? [])].map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              type={spec?.secretFields.some((item) => item.key === field.key) ? 'password' : 'text'}
              value={fields[field.key] ?? ''}
              placeholder={field.placeholder}
              onChange={(event) => setField(field.key, event.target.value)}
            />
          </label>
        ))}

        <div className="row">
          <button type="button" onClick={() => void add()}>
            추가
          </button>
          {spec?.signupUrl && (
            <a href={spec.signupUrl} target="_blank" rel="noreferrer">
              키 발급 페이지 열기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
