/**
 * Chrome Storage API のラッパー型定義
 */
export interface StorageAPI {
  get(keys: string | string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Chrome Tabs API のラッパー型定義
 */
export interface TabsAPI {
  get(tabId: number): Promise<chrome.tabs.Tab>;
  update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab>;
  query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]>;
  onActivated: chrome.tabs.TabActivatedEvent;
  onRemoved: chrome.tabs.TabRemovedEvent;
  onUpdated: chrome.tabs.TabUpdatedEvent;
}

/**
 * メッセージタイプ
 */
export type MessageType =
  | 'backward'
  | 'forward'
  | 'getHistory'
  | 'mouseBackward'
  | 'mouseForward';

/**
 * メッセージペイロード
 */
export interface Message {
  type: MessageType;
  payload?: unknown;
}
