import type { HistoryEntry, HistoryState } from '@/types/history';

const DEFAULT_MAX_SIZE = 100;

/**
 * タブ履歴を管理するマネージャー
 */
export class HistoryManager {
  private state: HistoryState;

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.state = {
      entries: [],
      currentIndex: 0,
      maxSize,
    };
  }

  /**
   * 新しい履歴エントリを追加
   */
  addEntry(entry: HistoryEntry): void {
    // 現在のエントリと同じタブIDの場合は追加しない
    const currentEntry = this.state.entries[this.state.currentIndex];
    if (currentEntry && currentEntry.tabId === entry.tabId) {
      return;
    }

    // currentIndexより前のForward履歴をクリア
    if (this.state.currentIndex > 0) {
      this.state.entries = this.state.entries.slice(this.state.currentIndex);
      this.state.currentIndex = 0;
    }

    // 新しいエントリを先頭に追加
    this.state.entries.unshift(entry);

    // 履歴上限を超えた場合、古いエントリを削除
    if (this.state.entries.length > this.state.maxSize) {
      this.state.entries = this.state.entries.slice(0, this.state.maxSize);
    }
  }

  /**
   * 現在の履歴状態を取得
   */
  getState(): HistoryState {
    return {
      ...this.state,
      entries: [...this.state.entries],
    };
  }

  /**
   * 履歴状態を復元
   */
  setState(state: HistoryState): void {
    this.state = {
      ...state,
      entries: [...state.entries],
    };
  }

  /**
   * 履歴から特定のタブIDを削除
   */
  removeTab(tabId: number): void {
    const removedIndex = this.state.entries.findIndex((entry) => entry.tabId === tabId);

    if (removedIndex === -1) {
      return;
    }

    this.state.entries = this.state.entries.filter((entry) => entry.tabId !== tabId);

    // 削除されたエントリがcurrentIndexより前にある場合、インデックスを調整
    if (removedIndex < this.state.currentIndex) {
      this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
    } else if (removedIndex === this.state.currentIndex && this.state.entries.length > 0) {
      // 現在位置のエントリが削除された場合、インデックスを維持（次のエントリが現在位置になる）
      this.state.currentIndex = Math.min(this.state.currentIndex, this.state.entries.length - 1);
    }
  }

  /**
   * 履歴をクリア
   */
  clear(): void {
    this.state.entries = [];
    this.state.currentIndex = 0;
  }
}
