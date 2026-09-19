import type { ProviderCategory } from './settings';

export type Pricing = 'free' | 'freemium' | 'paid';

export type InputField = {
  key: string;
  label: string;
  placeholder?: string;
};

export type ProviderSpec = {
  key: string;
  category: ProviderCategory;
  label: string;
  pricing: Pricing;
  /** 비밀 입력 항목. 비어 있으면 키 없이 쓰는 소스다. */
  secretFields: InputField[];
  /** 비밀이 아닌 설정 항목 (주소, 모델 이름 등) */
  optionFields?: InputField[];
  note?: string;
  signupUrl?: string;
};

export const PRICING_LABEL: Record<Pricing, string> = {
  free: '무료',
  freemium: '부분 무료',
  paid: '유료',
};

const apiKey: InputField = { key: 'apiKey', label: 'API 키' };

export const PROVIDERS: ProviderSpec[] = [
  // 뉴스
  {
    key: 'naver',
    category: 'news',
    label: '네이버 검색 API',
    pricing: 'free',
    secretFields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret' },
    ],
    note: '한국어 뉴스에 가장 적합합니다.',
    signupUrl: 'https://developers.naver.com/apps/#/register',
  },
  {
    key: 'rss',
    category: 'news',
    label: 'RSS 피드',
    pricing: 'free',
    secretFields: [],
    note: '키 없이 동작하는 최후 폴백입니다.',
  },
  {
    key: 'gnews',
    category: 'news',
    label: 'GNews',
    pricing: 'freemium',
    secretFields: [apiKey],
    signupUrl: 'https://gnews.io/',
  },
  {
    key: 'newsapi',
    category: 'news',
    label: 'NewsAPI.org',
    pricing: 'freemium',
    secretFields: [apiKey],
    note: '무료 플랜은 사용 조건에 제약이 있습니다.',
    signupUrl: 'https://newsapi.org/register',
  },

  // 논문
  {
    key: 'arxiv',
    category: 'paper',
    label: 'arXiv',
    pricing: 'free',
    secretFields: [],
    note: '키가 필요 없습니다.',
  },
  {
    key: 'openalex',
    category: 'paper',
    label: 'OpenAlex',
    pricing: 'free',
    secretFields: [],
    optionFields: [{ key: 'email', label: '연락용 이메일 (선택)', placeholder: '요청 한도 상향에 쓰입니다' }],
  },
  {
    key: 'semanticscholar',
    category: 'paper',
    label: 'Semantic Scholar',
    pricing: 'free',
    secretFields: [{ key: 'apiKey', label: 'API 키 (선택)' }],
    note: '키가 있으면 요청 한도가 올라갑니다.',
  },
  {
    key: 'pubmed',
    category: 'paper',
    label: 'PubMed',
    pricing: 'free',
    secretFields: [{ key: 'apiKey', label: 'API 키 (선택)' }],
    note: '의학·바이오 주제에 유용합니다.',
  },

  // LLM
  {
    key: 'local',
    category: 'llm',
    label: '내 컴퓨터의 로컬 모델',
    pricing: 'free',
    secretFields: [],
    optionFields: [
      { key: 'baseUrl', label: '주소', placeholder: 'http://localhost:11434/v1' },
      { key: 'model', label: '모델 이름', placeholder: 'qwen3:8b' },
    ],
    note: '비용이 들지 않고 호출 제한도 없으며 기사 내용이 밖으로 나가지 않습니다.',
  },
  {
    key: 'gemini',
    category: 'llm',
    label: 'Google Gemini',
    pricing: 'freemium',
    secretFields: [apiKey],
    optionFields: [{ key: 'model', label: '모델 이름 (선택)' }],
    signupUrl: 'https://aistudio.google.com/apikey',
  },
  {
    key: 'upstage',
    category: 'llm',
    label: 'Upstage Solar',
    pricing: 'freemium',
    secretFields: [apiKey],
    optionFields: [{ key: 'model', label: '모델 이름 (선택)' }],
    note: '한국어에 강점이 있습니다.',
    signupUrl: 'https://console.upstage.ai/',
  },
  {
    key: 'qwen',
    category: 'llm',
    label: 'Qwen 클라우드 (DashScope)',
    pricing: 'freemium',
    secretFields: [apiKey],
    optionFields: [
      { key: 'baseUrl', label: '주소 (선택)' },
      { key: 'model', label: '모델 이름 (선택)' },
    ],
  },
  {
    key: 'anthropic',
    category: 'llm',
    label: 'Anthropic Claude',
    pricing: 'paid',
    secretFields: [apiKey],
    optionFields: [{ key: 'model', label: '모델 이름 (선택)' }],
    signupUrl: 'https://console.anthropic.com/',
  },
  {
    key: 'openai',
    category: 'llm',
    label: 'OpenAI',
    pricing: 'paid',
    secretFields: [apiKey],
    optionFields: [{ key: 'model', label: '모델 이름 (선택)' }],
    signupUrl: 'https://platform.openai.com/api-keys',
  },

  // 아카이빙
  {
    key: 'notion',
    category: 'notion',
    label: 'Notion',
    pricing: 'free',
    secretFields: [{ key: 'token', label: '통합 시크릿' }],
    signupUrl: 'https://www.notion.so/my-integrations',
  },
];

export function findProvider(key: string): ProviderSpec | undefined {
  return PROVIDERS.find((provider) => provider.key === key);
}

export function providersOf(category: ProviderCategory): ProviderSpec[] {
  return PROVIDERS.filter((provider) => provider.category === category);
}
