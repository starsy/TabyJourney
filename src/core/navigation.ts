import type { HistoryManager } from './history-manager';
import type { NavigationResult } from '@/types/history';

/**
 * Controller for tab history navigation
 */
export class NavigationController {
  constructor(private historyManager: HistoryManager) {}

  /**
   * Navigate backward to previous history entry
   */
  backward(): NavigationResult {
    const state = this.historyManager.getState();

    // Cannot go back if history is empty or already at the oldest entry
    if (state.entries.length === 0) {
      return {
        success: false,
        error: 'No history available',
      };
    }

    // Calculate next index
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.entries.length) {
      return {
        success: false,
        error: 'Already at the oldest entry',
      };
    }

    // Update currentIndex
    const newState = {
      ...state,
      currentIndex: nextIndex,
    };
    this.historyManager.setState(newState);

    return {
      success: true,
      targetTabId: state.entries[nextIndex].tabId,
    };
  }

  /**
   * Navigate forward to next history entry
   */
  forward(): NavigationResult {
    const state = this.historyManager.getState();

    // Cannot go forward if currentIndex is 0
    if (state.currentIndex === 0) {
      return {
        success: false,
        error: 'Already at the newest entry',
      };
    }

    // Calculate previous index
    const prevIndex = state.currentIndex - 1;

    // Update currentIndex
    const newState = {
      ...state,
      currentIndex: prevIndex,
    };
    this.historyManager.setState(newState);

    return {
      success: true,
      targetTabId: state.entries[prevIndex].tabId,
    };
  }

  /**
   * Check if backward navigation is possible
   */
  canGoBackward(): boolean {
    const state = this.historyManager.getState();
    return state.entries.length > 0 && state.currentIndex < state.entries.length - 1;
  }

  /**
   * Check if forward navigation is possible
   */
  canGoForward(): boolean {
    const state = this.historyManager.getState();
    return state.currentIndex > 0;
  }
}
