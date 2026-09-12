export type AppInfo = {
  name: string;
  version: string;
  platform: NodeJS.Platform;
};

export const IpcChannel = {
  getAppInfo: 'app:get-info',
} as const;

export type NewsBridge = {
  getAppInfo: () => Promise<AppInfo>;
};
