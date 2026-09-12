import { app, Menu, Tray, nativeImage } from 'electron';
import trayIconPath from '../../resources/tray.png?asset';
import { markQuitting, showMainWindow } from './window';

let tray: Tray | null = null;

export function createTray(): Tray {
  const icon = nativeImage.createFromPath(trayIconPath);
  tray = new Tray(icon);
  tray.setToolTip('뉴스 브리핑');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '브리핑 열기', click: () => showMainWindow() },
      { type: 'separator' },
      {
        label: '종료',
        click: () => {
          markQuitting();
          app.quit();
        },
      },
    ]),
  );
  tray.on('click', () => showMainWindow());
  return tray;
}
