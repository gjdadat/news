import { useEffect, useState } from 'react';
import type { AppInfo } from '@shared/ipc';

export function App(): React.JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    void window.news.getAppInfo().then(setInfo);
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{info?.name ?? '뉴스 브리핑'}</h1>
          <p className="date">{today}</p>
        </div>
        <span className="version">{info ? `v${info.version}` : ''}</span>
      </header>

      <main className="empty">
        <p className="empty-title">아직 브리핑이 없습니다</p>
        <p className="empty-hint">
          관심 주제를 등록하면 매일 아침 뉴스와 논문을 모아 보여드립니다.
        </p>
      </main>
    </div>
  );
}
