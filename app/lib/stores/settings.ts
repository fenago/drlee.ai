import { atom, map } from 'nanostores';
import type { IProviderConfig } from '~/types/model';
import { PROVIDER_LIST } from '~/utils/constants';
import type {
  TabVisibilityConfig,
  TabWindowConfig,
  UserTabConfig,
  DevTabConfig,
} from '~/components/@settings/core/types';
import { DEFAULT_TAB_CONFIG } from '~/components/@settings/core/constants';
import Cookies from 'js-cookie';
import { toggleTheme } from './theme';
import { create } from 'zustand';

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
  description?: string; // Description of what the shortcut does
  isPreventDefault?: boolean; // Whether to prevent default browser behavior
}

export interface Shortcuts {
  toggleTheme: Shortcut;
  toggleTerminal: Shortcut;
}

export const URL_CONFIGURABLE_PROVIDERS = ['Ollama', 'LMStudio', 'OpenAILike'];
export const LOCAL_PROVIDERS = ['OpenAILike', 'LMStudio', 'Ollama'];

export type ProviderSetting = Record<string, IProviderConfig>;

// Simplified shortcuts store with only theme toggle
export const shortcutsStore = map<Shortcuts>({
  toggleTheme: {
    key: 'd',
    metaKey: true,
    altKey: true,
    shiftKey: true,
    action: () => toggleTheme(),
    description: 'Toggle theme',
    isPreventDefault: true,
  },
  toggleTerminal: {
    key: '`',
    ctrlOrMetaKey: true,
    action: () => {
      // This will be handled by the terminal component
    },
    description: 'Toggle terminal',
    isPreventDefault: true,
  },
});

// Create a single key for provider settings
const PROVIDER_SETTINGS_KEY = 'provider_settings';
const TAB_CONFIG_KEY = 'bolt_tab_configuration';

// Initialize provider settings from both localStorage and defaults
const getInitialProviderSettings = (): ProviderSetting => {
  const initialSettings: ProviderSetting = {};

  // Start with default settings - enable all providers except local ones
  PROVIDER_LIST.forEach((provider) => {
    initialSettings[provider.name] = {
      ...provider,
      settings: {
        // Local providers should be disabled by default
        enabled: !LOCAL_PROVIDERS.includes(provider.name),
        baseUrl: '',
      },
    };
  });

  /**
   * If no providers loaded yet (SSR or initial load), add a minimal Anthropic provider
   * This prevents blank page and will be replaced when actual providers load
   */
  if (Object.keys(initialSettings).length === 0) {
    initialSettings.Anthropic = {
      name: 'Anthropic',
      staticModels: [
        {
          name: 'claude-3-5-sonnet-latest',
          label: 'Claude 3.5 Sonnet',
          provider: 'Anthropic',
          maxTokenAllowed: 8192,
        },
      ],
      settings: {
        enabled: true, // Enable by default to prevent "No providers" error
        baseUrl: '',
      },
    } as IProviderConfig;
  }

  return initialSettings;
};

export const providersStore = map<ProviderSetting>(getInitialProviderSettings());

// Only run client-side initialization in browser
if (isBrowser) {
  // Load saved settings from localStorage
  const savedSettings = localStorage.getItem(PROVIDER_SETTINGS_KEY);

  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);

      // Only restore settings for providers that exist
      Object.entries(parsed).forEach(([key, value]) => {
        const providerConfig = value as IProviderConfig;

        if (providerConfig && providerConfig.settings) {
          const currentProvider = providersStore.get()[key];

          if (currentProvider) {
            providersStore.setKey(key, {
              ...currentProvider,
              settings: providerConfig.settings,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error parsing saved provider settings:', error);
    }
  }

  /*
   * Use a simple interval to check for provider list updates
   * This avoids dynamic imports that might break rendering
   */
  let checkCount = 0;
  const checkProviders = setInterval(() => {
    checkCount++;

    if (PROVIDER_LIST.length > 0) {
      const currentSettings = providersStore.get();
      let hasNewProviders = false;

      PROVIDER_LIST.forEach((provider) => {
        if (!currentSettings[provider.name]) {
          // New provider detected, add it to the store
          providersStore.setKey(provider.name, {
            ...provider,
            settings: {
              enabled: !LOCAL_PROVIDERS.includes(provider.name),
              baseUrl: '',
            },
          });
          hasNewProviders = true;
        }
      });

      /**
       * Save if we added new providers
       */
      if (hasNewProviders) {
        const allSettings = providersStore.get();
        localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(allSettings));
      }

      clearInterval(checkProviders);
    } else if (checkCount > 50) {
      // Stop checking after 5 seconds (50 * 100ms)
      clearInterval(checkProviders);
    }
  }, 100);
}

// Create a function to update provider settings that handles both store and persistence
export const updateProviderSettings = (provider: string, config: IProviderConfig) => {
  const currentSettings = providersStore.get();
  const updatedProvider = {
    ...currentSettings[provider],
    ...config,
  };

  // Update the store with new settings
  providersStore.setKey(provider, updatedProvider);

  // Save to localStorage
  if (isBrowser) {
    const allSettings = providersStore.get();
    localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(allSettings));
  }
};

export const isDebugMode = atom(false);

// Define keys for localStorage
const SETTINGS_KEYS = {
  LATEST_BRANCH: 'isLatestBranch',
  AUTO_SELECT_TEMPLATE: 'autoSelectTemplate',
  CONTEXT_OPTIMIZATION: 'contextOptimizationEnabled',
  EVENT_LOGS: 'isEventLogsEnabled',
  PROMPT_ID: 'promptId',
  DEVELOPER_MODE: 'isDeveloperMode',
} as const;

// Initialize settings from localStorage or defaults
const getInitialSettings = () => {
  const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
    if (!isBrowser) {
      return defaultValue;
    }

    const stored = localStorage.getItem(key);

    if (stored === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  };

  return {
    latestBranch: getStoredBoolean(SETTINGS_KEYS.LATEST_BRANCH, false),
    autoSelectTemplate: getStoredBoolean(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, true),
    contextOptimization: getStoredBoolean(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, true),
    eventLogs: getStoredBoolean(SETTINGS_KEYS.EVENT_LOGS, true),
    promptId: isBrowser ? localStorage.getItem(SETTINGS_KEYS.PROMPT_ID) || 'default' : 'default',
    developerMode: getStoredBoolean(SETTINGS_KEYS.DEVELOPER_MODE, false),
  };
};

// Initialize stores with persisted values
const initialSettings = getInitialSettings();

export const latestBranchStore = atom<boolean>(initialSettings.latestBranch);
export const autoSelectStarterTemplate = atom<boolean>(initialSettings.autoSelectTemplate);
export const enableContextOptimizationStore = atom<boolean>(initialSettings.contextOptimization);
export const isEventLogsEnabled = atom<boolean>(initialSettings.eventLogs);
export const promptStore = atom<string>(initialSettings.promptId);

// Helper functions to update settings with persistence
export const updateLatestBranch = (enabled: boolean) => {
  latestBranchStore.set(enabled);

  if (isBrowser) {
    localStorage.setItem(SETTINGS_KEYS.LATEST_BRANCH, JSON.stringify(enabled));
  }
};

export const updateAutoSelectTemplate = (enabled: boolean) => {
  autoSelectStarterTemplate.set(enabled);

  if (isBrowser) {
    localStorage.setItem(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, JSON.stringify(enabled));
  }
};

export const updateContextOptimization = (enabled: boolean) => {
  enableContextOptimizationStore.set(enabled);

  if (isBrowser) {
    localStorage.setItem(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, JSON.stringify(enabled));
  }
};

export const updateEventLogs = (enabled: boolean) => {
  isEventLogsEnabled.set(enabled);

  if (isBrowser) {
    localStorage.setItem(SETTINGS_KEYS.EVENT_LOGS, JSON.stringify(enabled));
  }
};

export const updatePromptId = (id: string) => {
  promptStore.set(id);

  if (isBrowser) {
    localStorage.setItem(SETTINGS_KEYS.PROMPT_ID, id);
  }
};

// Initialize tab configuration from localStorage or defaults
const getInitialTabConfiguration = (): TabWindowConfig => {
  const defaultConfig: TabWindowConfig = {
    userTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is UserTabConfig => tab.window === 'user'),
    developerTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is DevTabConfig => tab.window === 'developer'),
  };

  if (!isBrowser) {
    return defaultConfig;
  }

  try {
    const saved = localStorage.getItem('bolt_tab_configuration');

    if (!saved) {
      return defaultConfig;
    }

    const parsed = JSON.parse(saved);

    if (!parsed?.userTabs || !parsed?.developerTabs) {
      return defaultConfig;
    }

    // Ensure proper typing of loaded configuration
    return {
      userTabs: parsed.userTabs.filter((tab: TabVisibilityConfig): tab is UserTabConfig => tab.window === 'user'),
      developerTabs: parsed.developerTabs.filter(
        (tab: TabVisibilityConfig): tab is DevTabConfig => tab.window === 'developer',
      ),
    };
  } catch (error) {
    console.warn('Failed to parse tab configuration:', error);
    return defaultConfig;
  }
};

// console.log('Initial tab configuration:', getInitialTabConfiguration());

export const tabConfigStore = atom<TabWindowConfig>(getInitialTabConfiguration());

export const resetTabConfiguration = () => {
  const defaultConfig: TabWindowConfig = {
    userTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is UserTabConfig => tab.window === 'user'),
    developerTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is DevTabConfig => tab.window === 'developer'),
  };
  tabConfigStore.set(defaultConfig);

  if (isBrowser) {
    localStorage.setItem(TAB_CONFIG_KEY, JSON.stringify(defaultConfig));
  }
};

export const updateTabConfiguration = (config: Partial<TabWindowConfig>) => {
  const currentConfig = tabConfigStore.get();
  const updatedConfig = {
    ...currentConfig,
    ...config,
    userTabs: config.userTabs || currentConfig.userTabs,
    developerTabs: config.developerTabs || currentConfig.developerTabs,
  };
  tabConfigStore.set(updatedConfig);

  if (isBrowser) {
    localStorage.setItem(TAB_CONFIG_KEY, JSON.stringify(updatedConfig));
  }
};

// Helper function to update tab configuration
export const updateTabVisibility = (config: TabVisibilityConfig) => {
  const currentConfig = tabConfigStore.get();
  console.log('Current tab configuration before update:', currentConfig);

  const isUserTab = config.window === 'user';
  const targetArray = isUserTab ? 'userTabs' : 'developerTabs';

  // Only update the tab in its respective window
  const updatedTabs = currentConfig[targetArray].map((tab) => (tab.id === config.id ? { ...config } : tab));

  // If tab doesn't exist in this window yet, add it
  if (!updatedTabs.find((tab) => tab.id === config.id)) {
    updatedTabs.push(config);
  }

  // Create new config, only updating the target window's tabs
  const newConfig: TabWindowConfig = {
    ...currentConfig,
    [targetArray]: updatedTabs,
  };

  console.log('New tab configuration after update:', newConfig);

  tabConfigStore.set(newConfig);
  Cookies.set('tabConfiguration', JSON.stringify(newConfig), {
    expires: 365, // Set cookie to expire in 1 year
    path: '/',
    sameSite: 'strict',
  });
};

// Helper function to reset tab configuration
export const resetToDefaults = () => {
  const defaultConfig: TabWindowConfig = {
    userTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is UserTabConfig => tab.window === 'user'),
    developerTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is DevTabConfig => tab.window === 'developer'),
  };

  tabConfigStore.set(defaultConfig);

  if (isBrowser) {
    localStorage.setItem('bolt_tab_configuration', JSON.stringify(defaultConfig));
  }
};

// Developer mode store with persistence
export const developerModeStore = atom<boolean>(initialSettings.developerMode);

export const setDeveloperMode = (value: boolean) => {
  developerModeStore.set(value);

  if (isBrowser) {
    localStorage.setItem(SETTINGS_KEYS.DEVELOPER_MODE, JSON.stringify(value));
  }
};

// First, let's define the SettingsStore interface
interface SettingsStore {
  isOpen: boolean;
  selectedTab: string;
  openSettings: () => void;
  closeSettings: () => void;
  setSelectedTab: (tab: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  selectedTab: 'user', // Default tab

  openSettings: () => {
    set({
      isOpen: true,
      selectedTab: 'user', // Always open to user tab
    });
  },

  closeSettings: () => {
    set({
      isOpen: false,
      selectedTab: 'user', // Reset to user tab when closing
    });
  },

  setSelectedTab: (tab: string) => {
    set({ selectedTab: tab });
  },
}));
