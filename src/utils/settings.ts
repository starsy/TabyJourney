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
  backwardShortcut: {
    key: 'BracketLeft', // [
    alt: true,
    ctrl: false,
    shift: false,
    meta: false,
  },
  forwardShortcut: {
    key: 'BracketRight', // ]
    alt: true,
    ctrl: false,
    shift: false,
    meta: false,
  },
};

/**
 * Load settings from storage
 */
export async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(SETTINGS_KEY, (result) => {
      const settings = result[SETTINGS_KEY] as Settings | undefined;
      resolve(settings || DEFAULT_SETTINGS);
    });
  });
}

/**
 * Save settings to storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => {
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
