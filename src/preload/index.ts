import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel, type AppInfo, type NewsBridge } from '@shared/ipc';

const bridge: NewsBridge = {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IpcChannel.getAppInfo),
};

contextBridge.exposeInMainWorld('news', bridge);
