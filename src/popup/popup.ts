import type { HistoryState, HistoryEntry } from '@/types/history';

/**
 * Get history from Service Worker
 */
async function getHistory(): Promise<HistoryState> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'getHistory' }, (response) => {
      if (chrome.runtime.lastError || !response?.state) {
        reject(new Error(chrome.runtime.lastError?.message || response?.error || 'Cannot read tab history'));
        return;
      }

      resolve(response.state);
    });
  });
}

/**
 * Activate tab
 */
async function activateTab(tabId: number): Promise<void> {
  await chrome.tabs.update(tabId, { active: true });
}

/**
 * Execute backward command
 */
async function executeBackward(): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'backward' });
  // Don't close popup, refresh history to update display
  await refreshHistory();
}

/**
 * Execute forward command
 */
async function executeForward(): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'forward' });
  // Don't close popup, refresh history to update display
  await refreshHistory();
}

/**
 * Refresh history and update display
 */
async function refreshHistory(): Promise<void> {
  const state = await getHistory();
  updateHeader(state);
  renderHistoryList(state);
}

/**
 * Display relative time (e.g., "2 minutes ago")
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else {
    return `${days} days ago`;
  }
}

/**
 * Render history list
 */
function renderHistoryList(state: HistoryState): void {
  const listContainer = document.getElementById('history-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (state.entries.length === 0) {
    listContainer.innerHTML = '<div class="empty-message">No history</div>';
    return;
  }

  state.entries.forEach((entry: HistoryEntry, index: number) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    if (index === state.currentIndex) {
      item.classList.add('current');
    }

    // Favicon
    const favicon = document.createElement('img');
    favicon.className = 'favicon';
    favicon.src = entry.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    favicon.onerror = () => {
      favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    };

    // Text container
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

    // Click event
    item.addEventListener('click', async () => {
      await activateTab(entry.tabId);
      // Don't close popup, refresh history to update display
      await refreshHistory();
    });

    listContainer.appendChild(item);
  });
}

/**
 * Update header information
 */
function updateHeader(state: HistoryState): void {
  const countElement = document.getElementById('history-count');
  if (countElement) {
    countElement.textContent = `${state.entries.length} / ${state.maxSize}`;
  }

  // Enable/disable Backward/Forward buttons
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
 * Initialize
 */
async function initialize(): Promise<void> {
  const state = await getHistory();

  updateHeader(state);
  renderHistoryList(state);

  // Backward button
  const backwardBtn = document.getElementById('backward-btn');
  if (backwardBtn) {
    backwardBtn.addEventListener('click', executeBackward);
  }

  // Forward button
  const forwardBtn = document.getElementById('forward-btn');
  if (forwardBtn) {
    forwardBtn.addEventListener('click', executeForward);
  }
}

// Initialize after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  void initialize().catch((error: unknown) => {
    console.error('[TabyJourney] Failed to load history:', error);
    const list = document.getElementById('history-list');
    if (list) {
      list.textContent = 'Cannot load history. Close this popup and try again.';
    }
  });
});
