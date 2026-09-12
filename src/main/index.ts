import { app, ipcMain } from 'electron';
import { IpcChannel, type AppInfo } from '@shared/ipc';
import { createTray } from './tray';
import { createMainWindow, showMainWindow } from './window';

// 트레이에 상주하는 앱이므로 두 번째 실행은 창을 띄우는 것으로 끝낸다.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => showMainWindow());

  void app.whenReady().then(() => {
    ipcMain.handle(
      IpcChannel.getAppInfo,
      (): AppInfo => ({
        name: '뉴스 브리핑',
        version: app.getVersion(),
        platform: process.platform,
      }),
    );

    createTray();
    createMainWindow();

    app.on('activate', () => showMainWindow());
  });

  // 창을 닫으면 앱이 끝난다. 다음 아침 조사는 로그인 항목으로 다시 시작되면서 수행된다.
  app.on('window-all-closed', () => app.quit());
}
