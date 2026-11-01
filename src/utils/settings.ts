import type { Settings } from '@/types/history';

const SETTINGS_KEY = 'tabyjourney_settings';

/**
 * Default settings
 */
const DEFAULT_SETTINGS: Settings = {
  maxHistorySize: 100,
  removeClosedTabs: true,
  separateByWindow: false,
  enableMouseGesture: true,
  showNotification: true,
};

/**
 * Load settings from storage
 */
export async function loadSettings(): Promise<Settings> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(SETTINGS_KEY, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const settings = result[SETTINGS_KEY] as Partial<Settings> | undefined;
      resolve({ ...getDefaultSettings(), ...settings });
    });
  });
}

/**
 * Save settings to storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
}

/**
 * Get default settings
 */
export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}
