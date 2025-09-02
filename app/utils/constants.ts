import type { Template } from '~/types/template';
import type { ProviderInfo, IProviderSetting } from '~/types/model';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
export const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
export const PROMPT_COOKIE_KEY = 'cachedPrompt';

// Default providers for SSR - will be replaced on client
const DEFAULT_PROVIDER_INFO: ProviderInfo = {
  name: 'Anthropic',
  staticModels: [],
};

// These will be initialized on the client side only
export let PROVIDER_LIST: ProviderInfo[] = [];
export let DEFAULT_PROVIDER: ProviderInfo = DEFAULT_PROVIDER_INFO;

export const providerBaseUrlEnvKeys: Record<string, { baseUrlKey?: string; apiTokenKey?: string }> = {};

// Initialize on client side only
if (typeof window !== 'undefined') {
  // Dynamic import to avoid SSR issues
  import('~/lib/modules/llm/manager')
    .then((llmModule) => {
      const manager = llmModule.LLMManager.getInstance(import.meta.env);

      async function loadProviders(llmManager: any) {
        const providers = await llmManager.getAllProviders();

        // Update the exports
        PROVIDER_LIST = providers.map((p: any) => ({
          name: p.name,
          staticModels: p.staticModels || [],
          getDynamicModels: p.getDynamicModels
            ? (
                providerName: string,
                apiKeys?: Record<string, string>,
                providerSettings?: IProviderSetting,
                serverEnv?: Record<string, string>,
              ) => p.getDynamicModels!(apiKeys, providerSettings, serverEnv)
            : undefined,
          getApiKeyLink: p.getApiKeyLink,
          labelForGetApiKey: p.labelForGetApiKey,
          icon: p.icon,
        }));

        const defaultProvider = llmManager.getDefaultProvider();
        DEFAULT_PROVIDER = {
          name: defaultProvider.name,
          staticModels: defaultProvider.staticModels || [],
          getDynamicModels: defaultProvider.getDynamicModels
            ? (
                providerName: string,
                apiKeys?: Record<string, string>,
                providerSettings?: IProviderSetting,
                serverEnv?: Record<string, string>,
              ) => defaultProvider.getDynamicModels!(apiKeys, providerSettings, serverEnv)
            : undefined,
          getApiKeyLink: defaultProvider.getApiKeyLink,
          labelForGetApiKey: defaultProvider.labelForGetApiKey,
          icon: defaultProvider.icon,
        };

        // Populate provider base URL keys
        providers.forEach((provider: any) => {
          providerBaseUrlEnvKeys[provider.name] = {
            baseUrlKey: provider.config?.baseUrlKey,
            apiTokenKey: provider.config?.apiTokenKey,
          };
        });
      }
      loadProviders(manager);
    })
    .catch((err) => {
      console.error('Error loading providers:', err);
    });
}

// starter Templates

export const STARTER_TEMPLATES: Template[] = [
  {
    name: 'Expo App',
    label: 'Expo App',
    description: 'Expo starter template for building cross-platform mobile apps',
    githubRepo: 'xKevIsDev/bolt-expo-template',
    tags: ['mobile', 'expo', 'mobile-app', 'android', 'iphone'],
    icon: 'i-bolt:expo',
  },
  {
    name: 'Basic Astro',
    label: 'Astro Basic',
    description: 'Lightweight Astro starter template for building fast static websites',
    githubRepo: 'xKevIsDev/bolt-astro-basic-template',
    tags: ['astro', 'blog', 'performance'],
    icon: 'i-bolt:astro',
  },
  {
    name: 'NextJS Shadcn',
    label: 'Next.js with shadcn/ui',
    description: 'Next.js starter fullstack template integrated with shadcn/ui components and styling system',
    githubRepo: 'xKevIsDev/bolt-nextjs-shadcn-template',
    tags: ['nextjs', 'react', 'typescript', 'shadcn', 'tailwind'],
    icon: 'i-bolt:nextjs',
  },
  {
    name: 'Vite Shadcn',
    label: 'Vite with shadcn/ui',
    description: 'Vite starter fullstack template integrated with shadcn/ui components and styling system',
    githubRepo: 'xKevIsDev/vite-shadcn',
    tags: ['vite', 'react', 'typescript', 'shadcn', 'tailwind'],
    icon: 'i-bolt:shadcn',
  },
  {
    name: 'Qwik Typescript',
    label: 'Qwik TypeScript',
    description: 'Qwik framework starter with TypeScript for building resumable applications',
    githubRepo: 'xKevIsDev/bolt-qwik-ts-template',
    tags: ['qwik', 'typescript', 'performance', 'resumable'],
    icon: 'i-bolt:qwik',
  },
  {
    name: 'Remix Typescript',
    label: 'Remix TypeScript',
    description: 'Remix framework starter with TypeScript for full-stack web applications',
    githubRepo: 'xKevIsDev/bolt-remix-ts-template',
    tags: ['remix', 'typescript', 'fullstack', 'react'],
    icon: 'i-bolt:remix',
  },
  {
    name: 'Slidev',
    label: 'Slidev Presentation',
    description: 'Slidev starter template for creating developer-friendly presentations using Markdown',
    githubRepo: 'xKevIsDev/bolt-slidev-template',
    tags: ['slidev', 'presentation', 'markdown'],
    icon: 'i-bolt:slidev',
  },
  {
    name: 'Sveltekit',
    label: 'SvelteKit',
    description: 'SvelteKit starter template for building fast, efficient web applications',
    githubRepo: 'bolt-sveltekit-template',
    tags: ['svelte', 'sveltekit', 'typescript'],
    icon: 'i-bolt:svelte',
  },
  {
    name: 'Vanilla Vite',
    label: 'Vanilla + Vite',
    description: 'Minimal Vite starter template for vanilla JavaScript projects',
    githubRepo: 'xKevIsDev/vanilla-vite-template',
    tags: ['vite', 'vanilla-js', 'minimal'],
    icon: 'i-bolt:vite',
  },
  {
    name: 'Vite React',
    label: 'React + Vite + typescript',
    description: 'React starter template powered by Vite for fast development experience',
    githubRepo: 'xKevIsDev/bolt-vite-react-ts-template',
    tags: ['react', 'vite', 'frontend', 'website', 'app'],
    icon: 'i-bolt:react',
  },
  {
    name: 'Vite Typescript',
    label: 'Vite + TypeScript',
    description: 'Vite starter template with TypeScript configuration for type-safe development',
    githubRepo: 'xKevIsDev/bolt-vite-ts-template',
    tags: ['vite', 'typescript', 'minimal'],
    icon: 'i-bolt:typescript',
  },
  {
    name: 'Vue',
    label: 'Vue.js',
    description: 'Vue.js starter template with modern tooling and best practices',
    githubRepo: 'xKevIsDev/bolt-vue-template',
    tags: ['vue', 'typescript', 'frontend'],
    icon: 'i-bolt:vue',
  },
  {
    name: 'Angular',
    label: 'Angular Starter',
    description: 'A modern Angular starter template with TypeScript support and best practices configuration',
    githubRepo: 'xKevIsDev/bolt-angular-template',
    tags: ['angular', 'typescript', 'frontend', 'spa'],
    icon: 'i-bolt:angular',
  },
];
