import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from '@core/history-manager';
import type { HistoryEntry } from '@/types/history';

describe('HistoryManager', () => {
  let historyManager: HistoryManager;

  beforeEach(() => {
    historyManager = new HistoryManager();
  });

  describe('新しいタブアクティブ化の記録', () => {
    it('初期状態では履歴が空', () => {
      const state = historyManager.getState();

      expect(state.entries).toEqual([]);
      expect(state.currentIndex).toBe(0);
    });

    it('タブをアクティブ化すると履歴に追加される', () => {
      const entry: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example',
        favicon: '',
        timestamp: Date.now(),
      };

      historyManager.addEntry(entry);
      const state = historyManager.getState();

      expect(state.entries).toHaveLength(1);
      expect(state.entries[0]).toEqual(entry);
      expect(state.currentIndex).toBe(0);
    });

    it('複数のタブをアクティブ化すると順番に履歴に追加される', () => {
      const entry1: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example 1',
        favicon: '',
        timestamp: Date.now(),
      };

      const entry2: HistoryEntry = {
        tabId: 2,
        windowId: 1,
        url: 'https://example.org',
        title: 'Example 2',
        favicon: '',
        timestamp: Date.now() + 1000,
      };

      historyManager.addEntry(entry1);
      historyManager.addEntry(entry2);

      const state = historyManager.getState();

      expect(state.entries).toHaveLength(2);
      expect(state.entries[0]).toEqual(entry2); // 最新が先頭
      expect(state.entries[1]).toEqual(entry1);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe('重複タブの扱い', () => {
    it('同じタブを連続でアクティブ化しても履歴に追加しない', () => {
      const entry: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example',
        favicon: '',
        timestamp: Date.now(),
      };

      historyManager.addEntry(entry);
      historyManager.addEntry(entry);

      const state = historyManager.getState();

      expect(state.entries).toHaveLength(1);
    });

    it('異なるタブの後に以前のタブをアクティブ化すると新規エントリとして追加される', () => {
      const entry1: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example 1',
        favicon: '',
        timestamp: Date.now(),
      };

      const entry2: HistoryEntry = {
        tabId: 2,
        windowId: 1,
        url: 'https://example.org',
        title: 'Example 2',
        favicon: '',
        timestamp: Date.now() + 1000,
      };

      const entry1Again: HistoryEntry = {
        ...entry1,
        timestamp: Date.now() + 2000,
      };

      historyManager.addEntry(entry1);
      historyManager.addEntry(entry2);
      historyManager.addEntry(entry1Again);

      const state = historyManager.getState();

      expect(state.entries).toHaveLength(3);
      expect(state.entries[0].tabId).toBe(1); // entry1Againが最新
    });
  });

  describe('Forward履歴のクリア', () => {
    it('currentIndexより前のForward履歴がある状態で新規エントリを追加するとForward履歴がクリアされる', () => {
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

      // 履歴を追加
      entries.forEach((entry) => historyManager.addEntry(entry));

      // currentIndexを2に設定（3つ目のエントリに戻った状態）
      const state = historyManager.getState();
      state.currentIndex = 2;
      historyManager.setState(state);

      // 新しいエントリを追加
      const newEntry: HistoryEntry = {
        tabId: 4,
        windowId: 1,
        url: 'https://example.io',
        title: 'Example 4',
        favicon: '',
        timestamp: Date.now() + 3000,
      };

      historyManager.addEntry(newEntry);

      const newState = historyManager.getState();

      // Forward履歴（index 0, 1）がクリアされ、2つだけ残る
      expect(newState.entries).toHaveLength(2);
      expect(newState.entries[0]).toEqual(newEntry);
      expect(newState.currentIndex).toBe(0);
    });
  });

  describe('履歴上限到達時の削除', () => {
    it('履歴が上限を超えると古いエントリが削除される', () => {
      const smallHistoryManager = new HistoryManager(5);

      // 10個のエントリを追加
      for (let i = 1; i <= 10; i++) {
        const entry: HistoryEntry = {
          tabId: i,
          windowId: 1,
          url: `https://example.com/${i}`,
          title: `Example ${i}`,
          favicon: '',
          timestamp: Date.now() + i * 1000,
        };
        smallHistoryManager.addEntry(entry);
      }

      const state = smallHistoryManager.getState();

      // 上限は5なので、最新5件のみ残る
      expect(state.entries).toHaveLength(5);
      expect(state.entries[0].tabId).toBe(10); // 最新
      expect(state.entries[4].tabId).toBe(6); // 5つ前
    });
  });

  describe('タブ削除の処理', () => {
    it('履歴からタブを削除できる', () => {
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
      ];

      entries.forEach((entry) => historyManager.addEntry(entry));
      historyManager.removeTab(1);

      const state = historyManager.getState();

      expect(state.entries).toHaveLength(1);
      expect(state.entries[0].tabId).toBe(2);
    });

    it('存在しないタブIDを削除しても何も起きない', () => {
      const entry: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example',
        favicon: '',
        timestamp: Date.now(),
      };

      historyManager.addEntry(entry);
      historyManager.removeTab(999);

      const state = historyManager.getState();

      expect(state.entries).toHaveLength(1);
    });
  });
});
