import { randomUUID } from 'node:crypto';
import type { MutationResult } from '@shared/ipc';
import type { CredentialView, ProviderCategory, Settings } from '@shared/settings';
import { getSettings, updateSettings } from './store/settings';
import { deleteSecret, getSecret, isVaultAvailable, maskSecret, putSecret } from './vault';
import { testConnection } from './providers/test-connection';

export type AddCredentialInput = {
  category: ProviderCategory;
  providerKey: string;
  label: string;
  secrets: Record<string, string>;
  options?: Record<string, string>;
};

function withMask(settings: Settings): CredentialView[] {
  return [...settings.credentials]
    .sort((a, b) => a.order - b.order)
    .map((meta) => ({ ...meta, maskedSecret: maskSecret(meta.id) }));
}

function asResult(settings: Settings): MutationResult {
  return { credentials: withMask(settings) };
}

export function listCredentials(): CredentialView[] {
  return withMask(getSettings());
}

export function addCredential(input: AddCredentialInput): MutationResult {
  const settings = getSettings();
  const id = randomUUID();
  const sameCategory = settings.credentials.filter((item) => item.category === input.category);
  const hasSecrets = Object.keys(input.secrets).length > 0;

  if (hasSecrets && !isVaultAvailable()) {
    return {
      credentials: withMask(settings),
      error:
        '이 컴퓨터에서는 OS 자격증명 저장소를 쓸 수 없어 키를 안전하게 저장할 수 없습니다. 키가 필요 없는 소스나 로컬 모델을 사용해 주세요.',
    };
  }
  if (hasSecrets) {
    putSecret(id, input.secrets);
  }

  return asResult(
    updateSettings({
      credentials: [
        ...settings.credentials,
        {
          id,
          category: input.category,
          providerKey: input.providerKey,
          label: input.label,
          order: sameCategory.length,
          enabled: true,
          options: input.options ?? {},
        },
      ],
    }),
  );
}

export function removeCredential(id: string): MutationResult {
  deleteSecret(id);
  const settings = getSettings();
  return asResult(
    updateSettings({ credentials: settings.credentials.filter((item) => item.id !== id) }),
  );
}

export function setCredentialEnabled(id: string, enabled: boolean): MutationResult {
  const settings = getSettings();
  return asResult(
    updateSettings({
      credentials: settings.credentials.map((item) => (item.id === id ? { ...item, enabled } : item)),
    }),
  );
}

/** 폴백 순서를 한 칸 옮긴다. 순서가 곧 우선순위다. */
export function moveCredential(id: string, direction: -1 | 1): MutationResult {
  const settings = getSettings();
  const target = settings.credentials.find((item) => item.id === id);
  if (!target) return asResult(settings);

  const siblings = settings.credentials
    .filter((item) => item.category === target.category)
    .sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((item) => item.id === id);
  const swapWith = siblings[index + direction];
  if (!swapWith) return asResult(settings);

  const reordered = new Map([
    [target.id, swapWith.order],
    [swapWith.id, target.order],
  ]);
  return asResult(
    updateSettings({
      credentials: settings.credentials.map((item) =>
        reordered.has(item.id) ? { ...item, order: reordered.get(item.id) as number } : item,
      ),
    }),
  );
}

export async function testCredential(id: string): Promise<MutationResult> {
  const settings = getSettings();
  const meta = settings.credentials.find((item) => item.id === id);
  if (!meta) return asResult(settings);

  const result = await testConnection(meta.providerKey, getSecret(id) ?? {}, meta.options);
  return asResult(
    updateSettings({
      credentials: settings.credentials.map((item) =>
        item.id === id
          ? {
              ...item,
              lastCheckedAt: new Date().toISOString(),
              lastStatus: result.status,
              lastMessage: result.message,
            }
          : item,
      ),
    }),
  );
}
