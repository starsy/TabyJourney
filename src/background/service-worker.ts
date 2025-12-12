import { StorageManager } from '@core/storage';
import { HistoryManager } from '@core/history-manager';
import { NavigationController } from '@core/navigation';
import type { HistoryEntry } from '@/types/history';
import { ChromeStorageAdapter, getTabInfo, activateTab, tabExists } from './chrome-adapter';

// グローバルインスタンス
const storageAdapter = new ChromeStorageAdapter();
const storageManager = new StorageManager(storageAdapter);
const historyManager = new HistoryManager();
const navigationController = new NavigationController(historyManager);

// ナビゲーション中フラグ（履歴追加を防ぐ）
let isNavigating = false;

/**
 * 初期化: ストレージから履歴を読み込む
 */
async function initialize(): Promise<void> {
  try {
    const state = await storageManager.loadState();
    historyManager.setState(state);
    console.log('[TabyJourney] Initialized with', state.entries.length, 'entries');
  } catch (error) {
    console.error('[TabyJourney] Failed to initialize:', error);
  }
}

/**
 * 履歴を保存
 */
async function saveHistory(): Promise<void> {
  try {
    const state = historyManager.getState();
    await storageManager.saveState(state);
  } catch (error) {
    console.error('[TabyJourney] Failed to save history:', error);
  }
}

/**
 * タブアクティブ化イベントハンドラー
 */
async function handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
  // ナビゲーション中は履歴に追加しない
  if (isNavigating) {
    isNavigating = false;
    return;
  }

  try {
    const tab = await getTabInfo(activeInfo.tabId);

    // chrome:// や edge:// などの内部URLは無視
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) {
      return;
    }

    const entry: HistoryEntry = {
      tabId: tab.id!,
      windowId: activeInfo.windowId,
      url: tab.url || '',
      title: tab.title || '',
      favicon: tab.favIconUrl || '',
      timestamp: Date.now(),
    };

    historyManager.addEntry(entry);
    await saveHistory();

    console.log('[TabyJourney] Added entry:', entry.title);
  } catch (error) {
    console.error('[TabyJourney] Failed to handle tab activation:', error);
  }
}

/**
 * タブ削除イベントハンドラー
 */
async function handleTabRemoved(tabId: number): Promise<void> {
  try {
    historyManager.removeTab(tabId);
    await saveHistory();

    console.log('[TabyJourney] Removed tab from history:', tabId);
  } catch (error) {
    console.error('[TabyJourney] Failed to handle tab removal:', error);
  }
}

/**
 * Backwardコマンドの実行
 */
async function executeBackward(): Promise<void> {
  try {
    const result = navigationController.backward();

    if (!result.success) {
      console.log('[TabyJourney] Cannot go backward:', result.error);
      // TODO: 通知を表示
      return;
    }

    // タブが存在するか確認
    const exists = await tabExists(result.targetTabId!);
    if (!exists) {
      console.log('[TabyJourney] Target tab does not exist, removing from history');
      historyManager.removeTab(result.targetTabId!);
      await saveHistory();
      // リトライ
      await executeBackward();
      return;
    }

    // ナビゲーションフラグをON
    isNavigating = true;

    // タブをアクティブ化
    await activateTab(result.targetTabId!);
    await saveHistory();

    console.log('[TabyJourney] Navigated backward to tab:', result.targetTabId);
  } catch (error) {
    console.error('[TabyJourney] Failed to execute backward:', error);
    isNavigating = false;
  }
}

/**
 * Forwardコマンドの実行
 */
async function executeForward(): Promise<void> {
  try {
    const result = navigationController.forward();

    if (!result.success) {
      console.log('[TabyJourney] Cannot go forward:', result.error);
      // TODO: 通知を表示
      return;
    }

    // タブが存在するか確認
    const exists = await tabExists(result.targetTabId!);
    if (!exists) {
      console.log('[TabyJourney] Target tab does not exist, removing from history');
      historyManager.removeTab(result.targetTabId!);
      await saveHistory();
      // リトライ
      await executeForward();
      return;
    }

    // ナビゲーションフラグをON
    isNavigating = true;

    // タブをアクティブ化
    await activateTab(result.targetTabId!);
    await saveHistory();

    console.log('[TabyJourney] Navigated forward to tab:', result.targetTabId);
  } catch (error) {
    console.error('[TabyJourney] Failed to execute forward:', error);
    isNavigating = false;
  }
}

/**
 * コマンドハンドラー
 */
function handleCommand(command: string): void {
  console.log('[TabyJourney] Command received:', command);

  switch (command) {
    case 'backward':
    case 'backward-j':
      executeBackward();
      break;
    case 'forward':
    case 'forward-k':
      executeForward();
      break;
    case 'show-history':
      // ポップアップを開く（chrome.action.openPopup は Service Worker では使えない）
      console.log('[TabyJourney] Show history command (use popup icon)');
      break;
    default:
      console.warn('[TabyJourney] Unknown command:', command);
  }
}

/**
 * メッセージハンドラー（Content Script や Popup からのメッセージ）
 */
function handleMessage(
  message: { type: string; payload?: unknown },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
): boolean {
  console.log('[TabyJourney] Message received:', message.type);

  switch (message.type) {
    case 'backward':
    case 'mouseBackward':
      executeBackward();
      sendResponse({ success: true });
      break;
    case 'forward':
    case 'mouseForward':
      executeForward();
      sendResponse({ success: true });
      break;
    case 'getHistory':
      sendResponse({ state: historyManager.getState() });
      break;
    default:
      console.warn('[TabyJourney] Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true; // 非同期レスポンスを許可
}

// イベントリスナーを登録
chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.tabs.onRemoved.addListener(handleTabRemoved);
chrome.commands.onCommand.addListener(handleCommand);
chrome.runtime.onMessage.addListener(handleMessage);

// 初期化を実行
initialize();

console.log('[TabyJourney] Service worker loaded');
