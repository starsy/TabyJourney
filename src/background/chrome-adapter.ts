import type { StorageAPI } from '@/types/chrome-api';

/**
 * Chrome Storage API のアダプター
 */
export class ChromeStorageAdapter implements StorageAPI {
  async get(keys: string | string[] | null): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  }

  async set(items: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  }

  async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }
}

/**
 * Chrome Tabs API のヘルパー関数
 */
export async function getTabInfo(tabId: number): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tab);
      }
    });
  });
}

/**
 * タブをアクティブ化
 */
export async function activateTab(tabId: number): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tabId, { active: true }, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        reject(chrome.runtime.lastError || new Error('Failed to activate tab'));
      } else {
        resolve(tab);
      }
    });
  });
}

/**
 * タブの存在確認
 */
export async function tabExists(tabId: number): Promise<boolean> {
  try {
    await getTabInfo(tabId);
    return true;
  } catch {
    return false;
  }
}
