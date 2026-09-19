import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel, type NewsBridge } from '@shared/ipc';

const bridge: NewsBridge = {
  getAppInfo: () => ipcRenderer.invoke(IpcChannel.getAppInfo),
  getSettings: () => ipcRenderer.invoke(IpcChannel.getSettings),
  updateSettings: (patch) => ipcRenderer.invoke(IpcChannel.updateSettings, patch),
  listCredentials: () => ipcRenderer.invoke(IpcChannel.listCredentials),
  addCredential: (input) => ipcRenderer.invoke(IpcChannel.addCredential, input),
  removeCredential: (id) => ipcRenderer.invoke(IpcChannel.removeCredential, id),
  setCredentialEnabled: (id, enabled) => ipcRenderer.invoke(IpcChannel.setCredentialEnabled, id, enabled),
  moveCredential: (id, direction) => ipcRenderer.invoke(IpcChannel.moveCredential, id, direction),
  testCredential: (id) => ipcRenderer.invoke(IpcChannel.testCredential, id),
  detectLocalModels: () => ipcRenderer.invoke(IpcChannel.detectLocalModels),
};

contextBridge.exposeInMainWorld('news', bridge);
