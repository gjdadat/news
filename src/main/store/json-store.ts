import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export type LoadResult<T> = { value: T; recovered: boolean };

/**
 * 파일이 깨져 있으면 옆으로 치우고 기본값으로 계속 간다.
 * 앱이 시작조차 못 하는 것보다 낫다.
 */
export function loadJson<T>(path: string, fallback: T): LoadResult<T> {
  if (!existsSync(path)) return { value: fallback, recovered: false };
  try {
    return { value: JSON.parse(readFileSync(path, 'utf8')) as T, recovered: false };
  } catch {
    renameSync(path, `${path}.corrupt-${Date.now()}`);
    return { value: fallback, recovered: true };
  }
}

/** 임시 파일에 쓰고 교체한다. 저장 도중 앱이 꺼져도 기존 파일이 남는다. */
export function saveJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(value, null, 2), 'utf8');
  renameSync(temporaryPath, path);
}
