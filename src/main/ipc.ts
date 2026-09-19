import { app, ipcMain } from 'electron';
import { IpcChannel, type AddCredentialRequest, type AppInfo } from '@shared/ipc';
import type { Settings } from '@shared/settings';
import {
  addCredential,
  listCredentials,
  moveCredential,
  removeCredential,
  setCredentialEnabled,
  testCredential,
} from './credentials';
import { detectLocalRunners } from './providers/local-llm';
import { didRecoverFromCorruption, getSettings, updateSettings } from './store/settings';
import { isVaultAvailable } from './vault';

export function registerIpcHandlers(): void {
  ipcMain.handle(
    IpcChannel.getAppInfo,
    (): AppInfo => ({
      name: '뉴스 브리핑',
      version: app.getVersion(),
      platform: process.platform,
      vaultAvailable: isVaultAvailable(),
      settingsRecovered: didRecoverFromCorruption(),
    }),
  );

  ipcMain.handle(IpcChannel.getSettings, () => getSettings());
  ipcMain.handle(IpcChannel.updateSettings, (_event, patch: Partial<Settings>) => updateSettings(patch));

  ipcMain.handle(IpcChannel.listCredentials, () => listCredentials());
  ipcMain.handle(IpcChannel.addCredential, (_event, input: AddCredentialRequest) => addCredential(input));
  ipcMain.handle(IpcChannel.removeCredential, (_event, id: string) => removeCredential(id));
  ipcMain.handle(IpcChannel.setCredentialEnabled, (_event, id: string, enabled: boolean) =>
    setCredentialEnabled(id, enabled),
  );
  ipcMain.handle(IpcChannel.moveCredential, (_event, id: string, direction: -1 | 1) =>
    moveCredential(id, direction),
  );
  ipcMain.handle(IpcChannel.testCredential, (_event, id: string) => testCredential(id));

  ipcMain.handle(IpcChannel.detectLocalModels, () => detectLocalRunners());
}
