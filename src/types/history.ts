/**
 * タブ履歴のエントリ
 */
export interface HistoryEntry {
  tabId: number;
  windowId: number;
  url: string;
  title: string;
  favicon: string;
  timestamp: number;
}

/**
 * 履歴の状態管理
 */
export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize: number;
}

/**
 * 設定項目
 */
export interface Settings {
  maxHistorySize: number;
  removeClosedTabs: boolean;
  separateByWindow: boolean;
  enableMouseGesture: boolean;
  showNotification: boolean;
}

/**
 * ナビゲーションの方向
 */
export type NavigationDirection = 'backward' | 'forward';

/**
 * ナビゲーション結果
 */
export interface NavigationResult {
  success: boolean;
  targetTabId?: number;
  error?: string;
}
