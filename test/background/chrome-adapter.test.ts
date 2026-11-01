import { afterEach, describe, expect, it, vi } from 'vitest';
import { activateTab, ChromeStorageAdapter } from '@/background/chrome-adapter';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChromeStorageAdapter', () => {
  it.each(['get', 'set', 'remove', 'clear'] as const)('reports Chrome storage errors from %s', async (method) => {
    vi.stubGlobal('chrome', {
      runtime: { lastError: { message: 'Storage unavailable' } },
      storage: {
        local: {
          [method]: (...args: unknown[]) => {
            const callback = args[args.length - 1] as (result: object) => void;
            callback({});
          },
        },
      },
    });
    const adapter = new ChromeStorageAdapter();
    const result = method === 'set' ? adapter.set({})
      : method === 'get' ? adapter.get('history')
      : method === 'remove' ? adapter.remove('history') : adapter.clear();

    await expect(result).rejects.toThrow('Storage unavailable');
  });
});

describe('tab activation and popup focus', () => {
  it.each([true, false])('changes window focus only when needed (focused: %s)', async (focused) => {
    const focusWindow = vi.fn().mockResolvedValue(undefined);
    const getWindow = vi.fn().mockResolvedValue({ id: 2, focused });
    const updateTab = vi.fn((_id, _options, callback) => callback({ id: 7, windowId: 2 }));
    vi.stubGlobal('chrome', {
      runtime: {},
      tabs: { update: updateTab },
      windows: { get: getWindow, update: focusWindow },
    });

    const tab = await activateTab(7);

    expect(tab.id).toBe(7);
    expect(updateTab).toHaveBeenCalledWith(7, { active: true }, expect.any(Function));
    expect(getWindow).toHaveBeenCalledWith(2);

    if (focused) {
      expect(focusWindow).not.toHaveBeenCalled();
    } else {
      expect(focusWindow).toHaveBeenCalledOnce();
      expect(focusWindow).toHaveBeenCalledWith(2, { focused: true });
    }
  });
});
