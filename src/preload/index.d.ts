import type { NewsBridge } from '@shared/ipc';

declare global {
  interface Window {
    news: NewsBridge;
  }
}

export {};
