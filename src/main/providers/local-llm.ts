export type LocalRunner = {
  runner: string;
  baseUrl: string;
  models: string[];
};

/** 로컬 실행기들이 쓰는 흔한 주소. 사용자가 주소를 외우지 않아도 되도록 직접 찾아본다. */
const CANDIDATES = [
  { runner: 'Ollama', baseUrl: 'http://127.0.0.1:11434/v1' },
  { runner: 'LM Studio', baseUrl: 'http://127.0.0.1:1234/v1' },
  { runner: 'llama.cpp', baseUrl: 'http://127.0.0.1:8080/v1' },
  { runner: 'vLLM', baseUrl: 'http://127.0.0.1:8000/v1' },
];

type ModelsResponse = { data?: { id?: string }[] };

async function listModels(baseUrl: string): Promise<string[] | null> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ModelsResponse;
    const models = (body.data ?? [])
      .map((entry) => entry.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    return models;
  } catch {
    return null;
  }
}

/** 설치된 로컬 모델을 찾는다. 로컬 호출이라 실패해도 비용이 들지 않는다. */
export async function detectLocalRunners(): Promise<LocalRunner[]> {
  const results = await Promise.all(
    CANDIDATES.map(async (candidate) => {
      const models = await listModels(candidate.baseUrl);
      return models === null ? null : { ...candidate, models };
    }),
  );
  return results.filter((result): result is LocalRunner => result !== null);
}
