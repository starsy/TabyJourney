import type { HistoryManager } from './history-manager';
import type { NavigationResult } from '@/types/history';

/**
 * タブ履歴のナビゲーションを制御
 */
export class NavigationController {
  constructor(private historyManager: HistoryManager) {}

  /**
   * Backward: 1つ前の履歴へ戻る
   */
  backward(): NavigationResult {
    const state = this.historyManager.getState();

    // 履歴が空、または最後のエントリにいる場合は戻れない
    if (state.entries.length === 0) {
      return {
        success: false,
        error: 'No history available',
      };
    }

    // 次のインデックスを計算
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.entries.length) {
      return {
        success: false,
        error: 'Already at the oldest entry',
      };
    }

    // currentIndexを更新
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
   * Forward: 1つ先の履歴へ進む
   */
  forward(): NavigationResult {
    const state = this.historyManager.getState();

    // currentIndexが0の場合は進めない
    if (state.currentIndex === 0) {
      return {
        success: false,
        error: 'Already at the newest entry',
      };
    }

    // 前のインデックスを計算
    const prevIndex = state.currentIndex - 1;

    // currentIndexを更新
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
   * Backwardできるかチェック
   */
  canGoBackward(): boolean {
    const state = this.historyManager.getState();
    return state.entries.length > 0 && state.currentIndex < state.entries.length - 1;
  }

  /**
   * Forwardできるかチェック
   */
  canGoForward(): boolean {
    const state = this.historyManager.getState();
    return state.currentIndex > 0;
  }
}
