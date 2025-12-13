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
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string; // KeyboardEvent.code (e.g., 'BracketLeft', 'KeyH')
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
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
  backwardShortcut: KeyboardShortcut;
  forwardShortcut: KeyboardShortcut;
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
