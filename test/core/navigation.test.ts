import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationController } from '@core/navigation';
import { HistoryManager } from '@core/history-manager';
import type { HistoryEntry } from '@/types/history';

describe('NavigationController', () => {
  let navigationController: NavigationController;
  let historyManager: HistoryManager;

  beforeEach(() => {
    historyManager = new HistoryManager();
    navigationController = new NavigationController(historyManager);
  });

  describe('Backward（戻る）', () => {
    it('1つ前の履歴に戻れる', () => {
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

      const result = navigationController.backward();

      expect(result.success).toBe(true);
      expect(result.targetTabId).toBe(1);

      const state = historyManager.getState();
      expect(state.currentIndex).toBe(1);
    });

    it('連続で戻れる', () => {
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

      entries.forEach((entry) => historyManager.addEntry(entry));

      // 1回目のBackward
      let result = navigationController.backward();
      expect(result.success).toBe(true);
      expect(result.targetTabId).toBe(2);

      // 2回目のBackward
      result = navigationController.backward();
      expect(result.success).toBe(true);
      expect(result.targetTabId).toBe(1);

      const state = historyManager.getState();
      expect(state.currentIndex).toBe(2);
    });

    it('履歴が空の場合は戻れない', () => {
      const result = navigationController.backward();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('履歴の最後に達したら戻れない', () => {
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

      // 1回目のBackward（成功）
      navigationController.backward();

      // 2回目のBackward（履歴の最後なので失敗）
      const result = navigationController.backward();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Forward（進む）', () => {
    it('Backward後にForwardで戻れる', () => {
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

      // Backward
      navigationController.backward();

      // Forward
      const result = navigationController.forward();

      expect(result.success).toBe(true);
      expect(result.targetTabId).toBe(2);

      const state = historyManager.getState();
      expect(state.currentIndex).toBe(0);
    });

    it('Backwardしていない場合はForwardできない', () => {
      const entry: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example 1',
        favicon: '',
        timestamp: Date.now(),
      };

      historyManager.addEntry(entry);

      const result = navigationController.forward();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('ナビゲーション可否のチェック', () => {
    it('canGoBackward()は戻れる場合にtrueを返す', () => {
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

      expect(navigationController.canGoBackward()).toBe(true);
    });

    it('canGoBackward()は戻れない場合にfalseを返す', () => {
      expect(navigationController.canGoBackward()).toBe(false);

      const entry: HistoryEntry = {
        tabId: 1,
        windowId: 1,
        url: 'https://example.com',
        title: 'Example 1',
        favicon: '',
        timestamp: Date.now(),
      };

      historyManager.addEntry(entry);

      expect(navigationController.canGoBackward()).toBe(false);
    });

    it('canGoForward()はForwardできる場合にtrueを返す', () => {
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
      navigationController.backward();

      expect(navigationController.canGoForward()).toBe(true);
    });

    it('canGoForward()はForwardできない場合にfalseを返す', () => {
      expect(navigationController.canGoForward()).toBe(false);
    });
  });
});
