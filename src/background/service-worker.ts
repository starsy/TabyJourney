import { StorageManager } from '@core/storage';
import { HistoryManager } from '@core/history-manager';
import type { HistoryState, NavigationDirection, NavigationResult } from '@/types/history';
import { loadSettings } from '@utils/settings';
import { ChromeStorageAdapter, getTabInfo, activateTab } from './chrome-adapter';

const storageManager = new StorageManager(new ChromeStorageAdapter());
const historyManager = new HistoryManager();

// Match activation events to their target. A general flag can hide a user action.
const expectedActivations = new Set<number>();
let initialized = false;
let operationQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(async () => {
    // Retry a failed read on the next event. Never save an empty fallback state.
    if (!initialized) {
      historyManager.setState(await storageManager.loadState());
      initialized = true;
    }

    return operation();
  });

  // One failed operation must not block later events.
  operationQueue = result.catch(() => undefined);
  return result;
}

async function saveHistory(): Promise<void> {
  await storageManager.saveState(historyManager.getState());
}

function reportError(error: unknown): void {
  console.error('[TabyJourney] Operation failed:', error);
}

async function recordActivation(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
  const tab = await getTabInfo(activeInfo.tabId);
  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) {
    return;
  }

  historyManager.addEntry({
    tabId: activeInfo.tabId,
    windowId: activeInfo.windowId,
    url: tab.url || '',
    title: tab.title || '',
    favicon: tab.favIconUrl || '',
    timestamp: Date.now(),
  });
  await saveHistory();
}

async function navigate(direction: NavigationDirection): Promise<NavigationResult> {
  const state = historyManager.getState();
  const step = direction === 'backward' ? 1 : -1;
  const currentTabId = state.entries[state.currentIndex]?.tabId;

  for (let index = state.currentIndex + step; index >= 0 && index < state.entries.length; index += step) {
    const entry = state.entries[index];
    if (entry.tabId === currentTabId) {
      continue;
    }

    let tab: chrome.tabs.Tab;
    try {
      tab = await getTabInfo(entry.tabId);
    } catch {
      // Skip unavailable tabs without deleting the saved history.
      continue;
    }

    if (!tab.active) {
      expectedActivations.add(entry.tabId);
    }

    try {
      await activateTab(entry.tabId);
    } catch (error) {
      expectedActivations.delete(entry.tabId);
      throw error;
    }

    // Commit the position only after Chrome accepts the activation.
    historyManager.setState({ ...state, currentIndex: index });
    await saveHistory();
    return { success: true, targetTabId: entry.tabId };
  }

  return { success: false, error: `No available tab ${direction}` };
}

async function processMessage(message: { type: string }): Promise<NavigationResult | { state: HistoryState }> {
  switch (message.type) {
    case 'backward':
    case 'mouseBackward':
      return navigate('backward');
    case 'forward':
    case 'mouseForward':
      return navigate('forward');
    case 'getHistory':
      return { state: historyManager.getState() };
    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Register listeners synchronously so Chrome can deliver the event that wakes us.
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Consume this event before entering the queue. Navigation can still be running.
  if (expectedActivations.delete(activeInfo.tabId)) {
    return;
  }

  void enqueue(() => recordActivation(activeInfo)).catch(reportError);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  expectedActivations.delete(tabId);
  void enqueue(async () => {
    const settings = await loadSettings();
    if (settings.removeClosedTabs) {
      historyManager.removeTab(tabId);
      await saveHistory();
    }
  }).catch(reportError);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void enqueue(() => processMessage(message)).then(sendResponse, (error: unknown) => {
    reportError(error);
    sendResponse({ success: false, error: 'Cannot read or update tab history' });
  });

  return true;
});

// Chrome commands work without a content script on the active page.
// Use the same queue as popup buttons to keep navigation in order.
chrome.commands.onCommand.addListener((command) => {
  if (command === 'navigate-backward') {
    void enqueue(() => navigate('backward')).catch(reportError);
  } else if (command === 'navigate-forward') {
    void enqueue(() => navigate('forward')).catch(reportError);
  }
});
