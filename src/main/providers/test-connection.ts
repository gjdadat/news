import type { CredentialStatus } from '@shared/settings';

export type TestResult = {
  status: CredentialStatus;
  message: string;
};

type Probe = { url: string; headers?: Record<string, string> };

/**
 * 각 제공사에서 가장 값싼 호출 하나로 키가 살아 있는지만 본다.
 * 실제 수집·요약 어댑터는 M3·M4에서 붙는다.
 */
function buildProbe(
  providerKey: string,
  secrets: Record<string, string>,
  options: Record<string, string>,
): Probe | null {
  const key = secrets['apiKey'] ?? '';
  switch (providerKey) {
    case 'naver':
      return {
        url: 'https://openapi.naver.com/v1/search/news.json?query=test&display=1',
        headers: {
          'X-Naver-Client-Id': secrets['clientId'] ?? '',
          'X-Naver-Client-Secret': secrets['clientSecret'] ?? '',
        },
      };
    case 'gnews':
      return { url: `https://gnews.io/api/v4/search?q=test&max=1&apikey=${encodeURIComponent(key)}` };
    case 'newsapi':
      return {
        url: 'https://newsapi.org/v2/everything?q=test&pageSize=1',
        headers: { 'X-Api-Key': key },
      };
    case 'arxiv':
      return { url: 'https://export.arxiv.org/api/query?search_query=all:test&max_results=1' };
    case 'openalex':
      return { url: 'https://api.openalex.org/works?per-page=1' };
    case 'semanticscholar':
      return {
        url: 'https://api.semanticscholar.org/graph/v1/paper/search?query=test&limit=1',
        headers: key ? { 'x-api-key': key } : {},
      };
    case 'pubmed':
      return {
        url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=test&retmax=1${
          key ? `&api_key=${encodeURIComponent(key)}` : ''
        }`,
      };
    case 'rss':
      return null;
    case 'local': {
      const baseUrl = options['baseUrl'];
      return baseUrl ? { url: `${baseUrl.replace(/\/$/, '')}/models` } : null;
    }
    case 'gemini':
      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/models',
        headers: { 'x-goog-api-key': key },
      };
    case 'upstage':
      return { url: 'https://api.upstage.ai/v1/models', headers: { Authorization: `Bearer ${key}` } };
    case 'qwen': {
      const baseUrl = options['baseUrl'] ?? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
      return {
        url: `${baseUrl.replace(/\/$/, '')}/models`,
        headers: { Authorization: `Bearer ${key}` },
      };
    }
    case 'anthropic':
      return {
        url: 'https://api.anthropic.com/v1/models',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      };
    case 'openai':
      return { url: 'https://api.openai.com/v1/models', headers: { Authorization: `Bearer ${key}` } };
    case 'notion':
      return {
        url: 'https://api.notion.com/v1/users/me',
        headers: {
          Authorization: `Bearer ${secrets['token'] ?? ''}`,
          'Notion-Version': '2022-06-28',
        },
      };
    default:
      return null;
  }
}

function statusFromCode(code: number): TestResult {
  if (code === 401 || code === 403) return { status: 'auth_error', message: '키가 올바르지 않거나 권한이 없습니다' };
  if (code === 429) return { status: 'rate_limited', message: '요청 한도를 초과했습니다' };
  if (code >= 500) return { status: 'server_error', message: `제공사 서버 오류 (${code})` };
  if (code >= 400) return { status: 'unknown', message: `요청이 거부됐습니다 (${code})` };
  return { status: 'ok', message: '연결됐습니다' };
}

export async function testConnection(
  providerKey: string,
  secrets: Record<string, string>,
  options: Record<string, string>,
): Promise<TestResult> {
  const probe = buildProbe(providerKey, secrets, options);
  if (!probe) return { status: 'ok', message: '확인할 항목이 없습니다 (키가 필요 없는 소스)' };

  try {
    const response = await fetch(probe.url, {
      headers: probe.headers,
      signal: AbortSignal.timeout(providerKey === 'local' ? 10_000 : 15_000),
    });
    return statusFromCode(response.status);
  } catch {
    return {
      status: 'unreachable',
      message:
        providerKey === 'local'
          ? '로컬 모델 서버에 연결하지 못했습니다. 실행 중인지 확인해 주세요'
          : '연결하지 못했습니다. 인터넷 상태를 확인해 주세요',
    };
  }
}
