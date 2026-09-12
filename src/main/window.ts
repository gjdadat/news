import { join } from 'node:path';
import { BrowserWindow, shell } from 'electron';

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 920,
    height: 700,
    minWidth: 420,
    minHeight: 480,
    show: false,
    title: '뉴스 브리핑',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once('ready-to-show', () => window.show());

  // 외부 링크는 앱 안에서 열지 않고 기본 브라우저로 넘긴다.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
  if (rendererUrl) {
    void window.loadURL(rendererUrl);
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'));
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  mainWindow = window;
  return window;
}

export function showMainWindow(): void {
  const window = mainWindow ?? createMainWindow();
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
}
