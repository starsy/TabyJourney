import type { HistoryState, HistoryEntry } from '@/types/history';

/**
 * Service Workerから履歴を取得
 */
async function getHistory(): Promise<HistoryState> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'getHistory' }, (response) => {
      resolve(response.state);
    });
  });
}

/**
 * タブをアクティブ化
 */
async function activateTab(tabId: number): Promise<void> {
  await chrome.tabs.update(tabId, { active: true });
}

/**
 * Backward コマンドを実行
 */
async function executeBackward(): Promise<void> {
  chrome.runtime.sendMessage({ type: 'backward' });
  window.close(); // ポップアップを閉じる
}

/**
 * Forward コマンドを実行
 */
async function executeForward(): Promise<void> {
  chrome.runtime.sendMessage({ type: 'forward' });
  window.close(); // ポップアップを閉じる
}

/**
 * 相対時刻を表示（例: "2分前"）
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'たった今';
  } else if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else {
    return `${days}日前`;
  }
}

/**
 * 履歴リストを描画
 */
function renderHistoryList(state: HistoryState): void {
  const listContainer = document.getElementById('history-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (state.entries.length === 0) {
    listContainer.innerHTML = '<div class="empty-message">履歴がありません</div>';
    return;
  }

  state.entries.forEach((entry: HistoryEntry, index: number) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    if (index === state.currentIndex) {
      item.classList.add('current');
    }

    // ファビコン
    const favicon = document.createElement('img');
    favicon.className = 'favicon';
    favicon.src = entry.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    favicon.onerror = () => {
      favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    };

    // テキスト部分
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = entry.title || entry.url;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = getRelativeTime(entry.timestamp);

    textContainer.appendChild(title);
    textContainer.appendChild(meta);

    item.appendChild(favicon);
    item.appendChild(textContainer);

    // クリックイベント
    item.addEventListener('click', async () => {
      await activateTab(entry.tabId);
      window.close();
    });

    listContainer.appendChild(item);
  });
}

/**
 * ヘッダー情報を更新
 */
function updateHeader(state: HistoryState): void {
  const countElement = document.getElementById('history-count');
  if (countElement) {
    countElement.textContent = `${state.entries.length} / ${state.maxSize}`;
  }

  // Backward/Forwardボタンの有効/無効を設定
  const backwardBtn = document.getElementById('backward-btn') as HTMLButtonElement;
  const forwardBtn = document.getElementById('forward-btn') as HTMLButtonElement;

  if (backwardBtn) {
    backwardBtn.disabled = state.currentIndex >= state.entries.length - 1;
  }

  if (forwardBtn) {
    forwardBtn.disabled = state.currentIndex === 0;
  }
}

/**
 * 初期化
 */
async function initialize(): Promise<void> {
  const state = await getHistory();

  updateHeader(state);
  renderHistoryList(state);

  // Backward ボタン
  const backwardBtn = document.getElementById('backward-btn');
  if (backwardBtn) {
    backwardBtn.addEventListener('click', executeBackward);
  }

  // Forward ボタン
  const forwardBtn = document.getElementById('forward-btn');
  if (forwardBtn) {
    forwardBtn.addEventListener('click', executeForward);
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', initialize);
