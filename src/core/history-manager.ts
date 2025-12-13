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
    };
  }

  /**
   * Remove specific tabId from history
   */
  removeTab(tabId: number): void {
    const removedIndex = this.state.entries.findIndex((entry) => entry.tabId === tabId);

    if (removedIndex === -1) {
      return;
    }

    this.state.entries = this.state.entries.filter((entry) => entry.tabId !== tabId);

    // Adjust index if removed entry is before currentIndex
    if (removedIndex < this.state.currentIndex) {
      this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
    } else if (removedIndex === this.state.currentIndex && this.state.entries.length > 0) {
      // If current position is removed, maintain index (next entry becomes current)
      this.state.currentIndex = Math.min(this.state.currentIndex, this.state.entries.length - 1);
    }
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.state.entries = [];
    this.state.currentIndex = 0;
  }
}
