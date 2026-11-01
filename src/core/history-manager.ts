import type { HistoryEntry, HistoryState } from '@/types/history';

const DEFAULT_MAX_SIZE = 100;

/**
 * Manager for tab history
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
   * Add new history entry
   */
  addEntry(entry: HistoryEntry): void {
    // Don't add if same tabId as current entry
    const currentEntry = this.state.entries[this.state.currentIndex];
    if (currentEntry && currentEntry.tabId === entry.tabId) {
      return;
    }

    // Clear forward history before currentIndex
    if (this.state.currentIndex > 0) {
      this.state.entries = this.state.entries.slice(this.state.currentIndex);
      this.state.currentIndex = 0;
    }

    // Add new entry at the beginning
    this.state.entries.unshift(entry);

    // Remove old entries if exceeding max size
    if (this.state.entries.length > this.state.maxSize) {
      this.state.entries = this.state.entries.slice(0, this.state.maxSize);
    }
  }

  /**
   * Get current history state
   */
  getState(): HistoryState {
    return {
      ...this.state,
      entries: [...this.state.entries],
    };
  }

  /**
   * Restore history state
   */
  setState(state: HistoryState): void {
    this.state = {
      ...state,
      entries: [...state.entries],
      // Older saved states can contain an index beyond the remaining entries.
      currentIndex: Math.max(0, Math.min(state.currentIndex, state.entries.length - 1)),
    };
  }

  /**
   * Remove specific tabId from history
   */
  removeTab(tabId: number): void {
    const entries = this.state.entries;
    const removedBeforeCurrent = entries
      .slice(0, this.state.currentIndex)
      .filter((entry) => entry.tabId === tabId).length;

    this.state.entries = entries.filter((entry) => entry.tabId !== tabId);

    // One tab can occur several times before the current position.
    this.state.currentIndex = Math.max(0, Math.min(
      this.state.currentIndex - removedBeforeCurrent,
      this.state.entries.length - 1
    ));
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.state.entries = [];
    this.state.currentIndex = 0;
  }
}
