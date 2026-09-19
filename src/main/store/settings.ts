import { join } from 'node:path';
import { app } from 'electron';
import { DEFAULT_SETTINGS, type Settings } from '@shared/settings';
import { loadJson, saveJson } from './json-store';

let cached: Settings | null = null;
let recoveredFromCorruption = false;

function filePath(): string {
  return join(app.getPath('userData'), 'settings.json');
}

export function getSettings(): Settings {
  if (!cached) {
    const { value, recovered } = loadJson<Settings>(filePath(), DEFAULT_SETTINGS);
    // 이전 버전 파일에 없던 항목은 기본값으로 채운다.
    cached = { ...DEFAULT_SETTINGS, ...value };
    recoveredFromCorruption = recovered;
  }
  return cached;
}

export function saveSettings(next: Settings): Settings {
  cached = next;
  saveJson(filePath(), next);
  return next;
}

export function updateSettings(patch: Partial<Settings>): Settings {
  return saveSettings({ ...getSettings(), ...patch });
}

/** 설정 파일이 깨져 기본값으로 시작했는지 — 사용자에게 알려야 한다. */
export function didRecoverFromCorruption(): boolean {
  return recoveredFromCorruption;
}
