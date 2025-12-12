import type { Settings } from '@/types/history';

const SETTINGS_KEY = 'tabyjourney_settings';

/**
 * デフォルト設定
 */
const DEFAULT_SETTINGS: Settings = {
  maxHistorySize: 100,
  removeClosedTabs: true,
  separateByWindow: false,
  enableMouseGesture: true,
  showNotification: true,
};

/**
 * 設定を読み込む
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
 * 設定を保存する
 */
export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => {
      resolve();
    });
  });
}

/**
 * デフォルト設定を取得
 */
export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}
