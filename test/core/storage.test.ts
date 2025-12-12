import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '@core/storage';
import { createMockStorageAPI } from '../mocks/chrome-api-mock';
import type { HistoryState, HistoryEntry } from '@/types/history';

describe('StorageManager', () => {
  let storageManager: StorageManager;
  let mockStorage: ReturnType<typeof createMockStorageAPI>;

  beforeEach(() => {
    mockStorage = createMockStorageAPI();
    storageManager = new StorageManager(mockStorage);
  });

  describe('履歴の保存・読み込み', () => {
    it('初期状態では空の履歴状態を返す', async () => {
      const state = await storageManager.loadState();

      expect(state.entries).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.maxSize).toBe(100);
    });

    it('履歴状態を保存し、読み込める', async () => {
      const entry: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example',
        favicon: 'https://example.com/favicon.ico',
        timestamp: Date.now(),
      };

      const state: HistoryState = {
        entries: [entry],
        currentIndex: 0,
        maxSize: 100,
      };

      await storageManager.saveState(state);
      const loadedState = await storageManager.loadState();

      expect(loadedState.entries).toHaveLength(1);
      expect(loadedState.entries[0]).toEqual(entry);
      expect(loadedState.currentIndex).toBe(0);
    });

    it('複数のエントリを保存し、読み込める', async () => {
      const entries: HistoryEntry[] = [
        {
          tabId: 1,
          windowId: 1,
          url: 'https://example.com',
          title: 'Example 1',
          favicon: '',
          timestamp: Date.now(),
        },
        {
          tabId: 2,
          windowId: 1,
          url: 'https://example.org',
          title: 'Example 2',
          favicon: '',
          timestamp: Date.now() + 1000,
        },
        {
          tabId: 3,
          windowId: 1,
          url: 'https://example.net',
          title: 'Example 3',
          favicon: '',
          timestamp: Date.now() + 2000,
        },
      ];

      const state: HistoryState = {
        entries,
        currentIndex: 2,
        maxSize: 100,
      };

      await storageManager.saveState(state);
      const loadedState = await storageManager.loadState();

      expect(loadedState.entries).toHaveLength(3);
      expect(loadedState.currentIndex).toBe(2);
      expect(loadedState.entries).toEqual(entries);
    });
  });
});
