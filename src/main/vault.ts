import { join } from 'node:path';
import { app, safeStorage } from 'electron';
import { loadJson, saveJson } from './store/json-store';

/** credentialId → { 항목 이름: 비밀값 } */
type SecretBundle = Record<string, Record<string, string>>;

type VaultFile = { data?: string };

let cache: SecretBundle | null = null;

function filePath(): string {
  return join(app.getPath('userData'), 'credentials.enc');
}

export function isVaultAvailable(): boolean {
  return safeStorage.isEncryptionAvailable();
}

function read(): SecretBundle {
  if (cache) return cache;
  const { value } = loadJson<VaultFile>(filePath(), {});
  if (!value.data) {
    cache = {};
    return cache;
  }
  try {
    cache = JSON.parse(safeStorage.decryptString(Buffer.from(value.data, 'base64'))) as SecretBundle;
  } catch {
    // 다른 사용자 계정·다른 기기에서 만든 파일은 복호화할 수 없다. 키를 다시 받는 수밖에 없다.
    cache = {};
  }
  return cache;
}

function write(bundle: SecretBundle): void {
  const encrypted = safeStorage.encryptString(JSON.stringify(bundle)).toString('base64');
  saveJson(filePath(), { data: encrypted } satisfies VaultFile);
  cache = bundle;
}

export function putSecret(credentialId: string, fields: Record<string, string>): void {
  write({ ...read(), [credentialId]: fields });
}

export function getSecret(credentialId: string): Record<string, string> | undefined {
  return read()[credentialId];
}

export function deleteSecret(credentialId: string): void {
  const bundle = { ...read() };
  if (!(credentialId in bundle)) return;
  delete bundle[credentialId];
  write(bundle);
}

/** 화면에 보여줄 수 있는 형태. 원본은 절대 렌더러로 보내지 않는다. */
export function maskSecret(credentialId: string): string {
  const fields = getSecret(credentialId);
  if (!fields) return '';
  const first = Object.values(fields).find((value) => value.length > 0);
  if (!first) return '';
  return first.length <= 4 ? '••••' : `••••${first.slice(-4)}`;
}
