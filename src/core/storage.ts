import type { StorageAPI } from '@/types/chrome-api';
import type { HistoryState } from '@/types/history';

const STORAGE_KEY = 'tabyjourney_history_state';
const DEFAULT_MAX_SIZE = 100;

/**
 * Manager for persisting history state to Chrome Storage
 */
export class StorageManager {
  constructor(private storageAPI: StorageAPI) {}

  /**
   * Load history state from storage
   */
  async loadState(): Promise<HistoryState> {
    const result = await this.storageAPI.get(STORAGE_KEY);

    if (result[STORAGE_KEY]) {
      return result[STORAGE_KEY] as HistoryState;
    }

    return {
      entries: [],
      currentIndex: 0,
      maxSize: DEFAULT_MAX_SIZE,
    };
  }

  /**
   * Save history state to storage
   */
  async saveState(state: HistoryState): Promise<void> {
    await this.storageAPI.set({
      [STORAGE_KEY]: state,
    });
  }

  /**
   * Clear history state from storage
   */
  async clearState(): Promise<void> {
    await this.storageAPI.remove(STORAGE_KEY);
  }
}
