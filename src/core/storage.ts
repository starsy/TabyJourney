import type { StorageAPI } from '@types/chrome-api';
import type { HistoryState } from '@types/history';

const STORAGE_KEY = 'tabyjourney_history_state';
const DEFAULT_MAX_SIZE = 100;

/**
 * 履歴状態をChrome Storageに永続化するマネージャー
 */
export class StorageManager {
  constructor(private storageAPI: StorageAPI) {}

  /**
   * 履歴状態を読み込む
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
   * 履歴状態を保存する
   */
  async saveState(state: HistoryState): Promise<void> {
    await this.storageAPI.set({
      [STORAGE_KEY]: state,
    });
  }

  /**
   * 履歴状態をクリアする
   */
  async clearState(): Promise<void> {
    await this.storageAPI.remove(STORAGE_KEY);
  }
}
