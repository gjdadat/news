import type { CredentialView, Settings } from './settings';

export type AppInfo = {
  name: string;
  version: string;
  platform: NodeJS.Platform;
  /** OS 자격증명 저장소를 쓸 수 있는지. 못 쓰면 키를 저장하지 않는다. */
  vaultAvailable: boolean;
  /** 설정 파일이 깨져 기본값으로 시작했는지 */
  settingsRecovered: boolean;
};

export type LocalRunner = {
  runner: string;
  baseUrl: string;
  models: string[];
};

/** 자격증명 변경 결과. 실패 사유는 조용히 삼키지 않고 화면에 띄운다. */
export type MutationResult = {
  credentials: CredentialView[];
  error?: string;
};

export type AddCredentialRequest = {
  category: CredentialView['category'];
  providerKey: string;
  label: string;
  secrets: Record<string, string>;
  options?: Record<string, string>;
};

export const IpcChannel = {
  getAppInfo: 'app:get-info',
  getSettings: 'settings:get',
  updateSettings: 'settings:update',
  listCredentials: 'credentials:list',
  addCredential: 'credentials:add',
  removeCredential: 'credentials:remove',
  setCredentialEnabled: 'credentials:set-enabled',
  moveCredential: 'credentials:move',
  testCredential: 'credentials:test',
  detectLocalModels: 'llm:detect-local',
} as const;

export type NewsBridge = {
  getAppInfo: () => Promise<AppInfo>;
  getSettings: () => Promise<Settings>;
  updateSettings: (patch: Partial<Settings>) => Promise<Settings>;
  listCredentials: () => Promise<CredentialView[]>;
  addCredential: (input: AddCredentialRequest) => Promise<MutationResult>;
  removeCredential: (id: string) => Promise<MutationResult>;
  setCredentialEnabled: (id: string, enabled: boolean) => Promise<MutationResult>;
  moveCredential: (id: string, direction: -1 | 1) => Promise<MutationResult>;
  testCredential: (id: string) => Promise<MutationResult>;
  detectLocalModels: () => Promise<LocalRunner[]>;
};
