/**
 * Tab history entry
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
 * History state management
 */
export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize: number;
}

/**
 * User settings
 */
export interface Settings {
  maxHistorySize: number;
  removeClosedTabs: boolean;
  separateByWindow: boolean;
  enableMouseGesture: boolean;
  showNotification: boolean;
}

/**
 * Navigation direction
 */
export type NavigationDirection = 'backward' | 'forward';

/**
 * Navigation result
 */
export interface NavigationResult {
  success: boolean;
  targetTabId?: number;
  error?: string;
}
