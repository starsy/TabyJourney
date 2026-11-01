import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HistoryState } from '@/types/history';

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(),
  getTab: vi.fn(),
  activate: vi.fn(),
  settings: vi.fn(),
}));

vi.mock('@core/storage', () => ({
  StorageManager: class {
    loadState = mocks.load;
    saveState = mocks.save;
  },
}));
vi.mock('@/background/chrome-adapter', () => ({
  ChromeStorageAdapter: class {},
  getTabInfo: mocks.getTab,
  activateTab: mocks.activate,
}));
vi.mock('@utils/settings', () => ({ loadSettings: mocks.settings }));

function makeState(ids = [4, 3, 2, 1], currentIndex = 0): HistoryState {
  return {
    entries: ids.map((tabId) => ({
      tabId, windowId: 1, url: `https://example.com/${tabId}`,
      title: `Tab ${tabId}`, favicon: '', timestamp: tabId,
    })),
    currentIndex,
    maxSize: 100,
  };
}

let onActivated: (info: { tabId: number; windowId: number }) => void;
let onRemoved: (tabId: number) => void;
let onCommand: (command: string) => void;
let onMessage: (message: { type: string }, sender: object, respond: (value: any) => void) => boolean;

function send(type: string): Promise<any> {
  return new Promise((resolve) => onMessage({ type }, {}, resolve));
}

async function startWorker(): Promise<void> {
  vi.resetModules();
  vi.stubGlobal('chrome', {
    tabs: {
      onActivated: { addListener: (listener: typeof onActivated) => { onActivated = listener; } },
      onRemoved: { addListener: (listener: typeof onRemoved) => { onRemoved = listener; } },
    },
    commands: {
      onCommand: { addListener: (listener: typeof onCommand) => { onCommand = listener; } },
    },
    runtime: {
      onMessage: { addListener: (listener: typeof onMessage) => { onMessage = listener; } },
      onInstalled: { addListener: vi.fn() },
      onStartup: { addListener: vi.fn() },
    },
  });
  await import('@/background/service-worker');
}

beforeEach(async () => {
  vi.resetAllMocks();
  mocks.load.mockResolvedValue(makeState());
  mocks.save.mockResolvedValue(undefined);
  mocks.settings.mockResolvedValue({ removeClosedTabs: true });
  mocks.getTab.mockImplementation(async (id: number) => ({
    id, windowId: 1, active: false, url: `https://example.com/${id}`,
  }));
  mocks.activate.mockImplementation(async (id: number) => {
    onActivated({ tabId: id, windowId: 1 });
  });
  await startWorker();
});

describe('service worker history lifecycle', () => {
  it('waits for saved history before replying or recording an activation', async () => {
    let restore!: (state: HistoryState) => void;
    mocks.load.mockReturnValue(new Promise<HistoryState>((resolve) => { restore = resolve; }));
    mocks.load.mockClear();
    await startWorker();
    let replied = false;
    const response = send('getHistory');
    void response.then(() => { replied = true; });
    onActivated({ tabId: 5, windowId: 1 });
    await vi.waitFor(() => expect(mocks.load).toHaveBeenCalledOnce());
    expect(mocks.save).not.toHaveBeenCalled();
    expect(replied).toBe(false);

    restore(makeState());
    expect((await response).state.entries).toHaveLength(4);
    expect((await send('getHistory')).state.entries.map((entry: { tabId: number }) => entry.tabId))
      .toEqual([5, 4, 3, 2, 1]);
    expect(mocks.load).toHaveBeenCalledOnce();
  });

  it('restores the saved position after a worker restart', async () => {
    await send('backward');
    const saved = mocks.save.mock.calls[0][0];
    mocks.load.mockResolvedValue(saved);
    await startWorker();

    expect((await send('getHistory')).state).toEqual(saved);
    expect((await send('backward')).targetTabId).toBe(2);
  });

  it('does not replace saved history after a failed read and retries later', async () => {
    mocks.load.mockRejectedValueOnce(new Error('Storage unavailable'));
    onActivated({ tabId: 5, windowId: 1 });
    expect((await send('getHistory')).state.entries).toHaveLength(4);
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.load).toHaveBeenCalledTimes(2);
  });

  it('returns an error instead of an empty history when loading fails', async () => {
    mocks.load.mockRejectedValueOnce(new Error('Storage unavailable'));
    expect(await send('getHistory')).toEqual({
      success: false, error: 'Cannot read or update tab history',
    });
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('serializes fast shortcuts and retains all entries in both directions', async () => {
    const results = await Promise.all([send('backward'), send('backward'), send('backward')]);
    expect(results.map((result) => result.targetTabId)).toEqual([3, 2, 1]);
    expect((await send('getHistory')).state.entries).toHaveLength(4);
    expect((await send('forward')).targetTabId).toBe(2);
    expect((await send('forward')).targetTabId).toBe(3);
    expect((await send('forward')).targetTabId).toBe(4);
  });

  it('skips unavailable entries without skipping the next available backward target', async () => {
    mocks.getTab.mockRejectedValueOnce(new Error('No tab'));
    expect((await send('backward')).targetTabId).toBe(2);
    expect((await send('getHistory')).state.entries).toHaveLength(4);
  });

  it('skips unavailable entries when moving forward', async () => {
    mocks.load.mockResolvedValue(makeState([4, 3, 2, 1], 3));
    mocks.getTab.mockRejectedValueOnce(new Error('No tab'));
    expect((await send('forward')).targetTabId).toBe(3);
  });

  it('keeps the position after a failed activation', async () => {
    mocks.activate.mockRejectedValueOnce(new Error('Activation failed'));
    expect((await send('backward')).success).toBe(false);
    expect((await send('getHistory')).state.currentIndex).toBe(0);
    expect((await send('backward')).targetTabId).toBe(3);
  });

  it('does not hide a user activation when the navigation target was already active', async () => {
    mocks.getTab.mockResolvedValueOnce({ id: 3, active: true, windowId: 1 });
    mocks.activate.mockResolvedValueOnce(undefined);
    await send('backward');
    onActivated({ tabId: 5, windowId: 1 });
    expect((await send('getHistory')).state.entries[0].tabId).toBe(5);
  });

  it('accepts delayed navigation events without trimming forward history', async () => {
    mocks.activate.mockResolvedValueOnce(undefined);
    await send('backward');
    onActivated({ tabId: 3, windowId: 1 });
    expect((await send('getHistory')).state.entries).toHaveLength(4);
  });

  it('honors the setting to retain closed tabs', async () => {
    mocks.settings.mockResolvedValue({ removeClosedTabs: false });
    onRemoved(3);
    expect((await send('getHistory')).state.entries).toHaveLength(4);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('reports a failed save and continues to handle requests', async () => {
    mocks.save.mockRejectedValueOnce(new Error('Storage full'));
    expect((await send('backward')).success).toBe(false);
    expect((await send('getHistory')).state.currentIndex).toBe(1);
    expect((await send('backward')).success).toBe(true);
  });
});

describe('Chrome navigation commands', () => {
  it('navigates backward and forward without a content-script message', async () => {
    onCommand('navigate-backward');
    expect((await send('getHistory')).state.currentIndex).toBe(1);
    expect(mocks.activate).toHaveBeenLastCalledWith(3);

    onCommand('navigate-forward');
    expect((await send('getHistory')).state.currentIndex).toBe(0);
    expect(mocks.activate).toHaveBeenLastCalledWith(4);
  });

  it('keeps fast commands and popup navigation in the same order', async () => {
    onCommand('navigate-backward');
    const popupResponse = send('backward');
    onCommand('navigate-backward');

    expect((await popupResponse).targetTabId).toBe(2);
    expect((await send('getHistory')).state.currentIndex).toBe(3);
    expect(mocks.activate.mock.calls.map(([id]) => id)).toEqual([3, 2, 1]);
    expect((await send('getHistory')).state.entries).toHaveLength(4);
  });

  it('ignores commands that do not belong to history navigation', async () => {
    onCommand('_execute_action');
    onCommand('unknown-command');

    expect((await send('getHistory')).state.currentIndex).toBe(0);
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('does not move beyond the oldest entry', async () => {
    mocks.load.mockResolvedValue(makeState([4, 3, 2, 1], 3));
    onCommand('navigate-backward');

    expect((await send('getHistory')).state.currentIndex).toBe(3);
    expect(mocks.activate).not.toHaveBeenCalled();
  });

  it('continues after a command activation fails', async () => {
    mocks.activate.mockRejectedValueOnce(new Error('Activation failed'));
    onCommand('navigate-backward');
    expect((await send('getHistory')).state.currentIndex).toBe(0);

    onCommand('navigate-backward');
    expect((await send('getHistory')).state.currentIndex).toBe(1);
  });
});
