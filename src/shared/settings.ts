export type ProviderCategory = 'news' | 'paper' | 'llm' | 'notion';

export type CredentialStatus = 'ok' | 'auth_error' | 'rate_limited' | 'server_error' | 'unreachable' | 'unknown';

export type CredentialMeta = {
  id: string;
  category: ProviderCategory;
  providerKey: string;
  label: string;
  order: number;
  enabled: boolean;
  /** 비밀이 아닌 접속 정보 (로컬 모델 주소, 모델 이름 등) */
  options: Record<string, string>;
  lastCheckedAt?: string;
  lastStatus?: CredentialStatus;
  lastMessage?: string;
};

/** 렌더러로 보내는 형태. 키 본문은 절대 포함하지 않는다. */
export type CredentialView = CredentialMeta & { maskedSecret: string };

export type NotionStatus = 'unconfigured' | 'connected' | 'needs_reconnect';

export type Settings = {
  version: 1;
  onboardingCompleted: boolean;
  topics: {
    keywords: string[];
    categories: string[];
  };
  sources: {
    includeNews: boolean;
    includePapers: boolean;
    newsWindowHours: number;
    paperWindowDays: number;
    maxPerSource: number;
  };
  schedule: {
    autoRunHour: number;
    autoRunMinute: number;
    startAtLogin: boolean;
    notify: boolean;
  };
  seen: {
    retentionDays: 7 | 30 | 90;
    includeFollowUps: boolean;
    excludePapers: boolean;
  };
  llm: {
    prefetchSummaries: boolean;
    dailyCallLimit: number;
  };
  notion: {
    status: NotionStatus;
    databaseId?: string;
    databaseTitle?: string;
  };
  credentials: CredentialMeta[];
};

export const TOPIC_CATEGORIES = [
  'IT·과학',
  '경제',
  '의학·바이오',
  '정책·사회',
  '산업·기업',
  '국제',
] as const;

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  onboardingCompleted: false,
  topics: { keywords: [], categories: [] },
  sources: {
    includeNews: true,
    includePapers: true,
    newsWindowHours: 48,
    paperWindowDays: 14,
    maxPerSource: 20,
  },
  schedule: { autoRunHour: 8, autoRunMinute: 0, startAtLogin: true, notify: true },
  seen: { retentionDays: 30, includeFollowUps: false, excludePapers: false },
  llm: { prefetchSummaries: false, dailyCallLimit: 20 },
  notion: { status: 'unconfigured' },
  credentials: [],
};
