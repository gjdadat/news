import { useEffect, useState } from 'react';
import type { AppInfo } from '@shared/ipc';
import type { CredentialView, Settings } from '@shared/settings';
import { Onboarding } from './components/Onboarding';
import { SettingsScreen } from './components/SettingsScreen';

export function App(): React.JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [credentials, setCredentials] = useState<CredentialView[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    void (async () => {
      setInfo(await window.news.getAppInfo());
      setSettings(await window.news.getSettings());
      setCredentials(await window.news.listCredentials());
    })();
  }, []);

  const patchSettings = async (patch: Partial<Settings>): Promise<void> => {
    setSettings(await window.news.updateSettings(patch));
  };

  if (!settings) return <div className="app loading">불러오는 중…</div>;

  const vaultWarning = info && !info.vaultAvailable && (
    <p className="banner warn">
      이 컴퓨터에서는 OS 자격증명 저장소를 쓸 수 없어 API 키를 안전하게 저장할 수 없습니다. 키가 필요 없는 소스나
      로컬 모델을 사용해 주세요.
    </p>
  );

  if (!settings.onboardingCompleted) {
    return (
      <div className="app">
        {vaultWarning}
        <Onboarding
          settings={settings}
          credentials={credentials}
          onCredentialsChange={setCredentials}
          onFinish={(next) => void patchSettings(next)}
        />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="app">
        {vaultWarning}
        <SettingsScreen
          settings={settings}
          credentials={credentials}
          onSettingsChange={(patch) => void patchSettings(patch)}
          onCredentialsChange={setCredentials}
          onClose={() => setShowSettings(false)}
        />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const topics = [...settings.topics.keywords, ...settings.topics.categories];

  return (
    <div className="app">
      {info?.settingsRecovered && (
        <p className="banner warn">설정 파일이 손상돼 기본값으로 시작했습니다. 설정을 다시 확인해 주세요.</p>
      )}
      <header className="header">
        <div>
          <h1>{info?.name ?? '뉴스 브리핑'}</h1>
          <p className="date">{today}</p>
          {topics.length > 0 && <p className="date">주제: {topics.join(', ')}</p>}
        </div>
        <div className="row">
          <button type="button" onClick={() => setShowSettings(true)}>
            설정
          </button>
          <span className="version">{info ? `v${info.version}` : ''}</span>
        </div>
      </header>

      <main className="empty">
        <p className="empty-title">아직 브리핑이 없습니다</p>
        <p className="empty-hint">뉴스와 논문을 모으는 기능은 다음 단계에서 붙습니다.</p>
      </main>
    </div>
  );
}
