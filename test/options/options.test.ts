import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const createTab = vi.fn();
const readSettings = vi.fn();
const writeSettings = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  document.body.innerHTML = new DOMParser().parseFromString(
    readFileSync('src/options/options.html', 'utf8'), 'text/html'
  ).body.innerHTML;

  createTab.mockResolvedValue({});
  readSettings.mockImplementation((_key, callback) => callback({
    tabyjourney_settings: {
      maxHistorySize: 200,
      removeClosedTabs: false,
      // Old saved keys must not return as editable settings or active bindings.
      backwardShortcut: { key: 'BracketLeft', ctrl: true, meta: true },
      forwardShortcut: { key: 'BracketRight', ctrl: true, meta: true },
    },
  }));
  writeSettings.mockImplementation((_settings, callback) => callback());
  vi.stubGlobal('chrome', {
    runtime: {},
    tabs: { create: createTab },
    storage: { sync: { get: readSettings, set: writeSettings } },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function initializeOptions(): Promise<void> {
  // Invoke this page's startup handler without retaining document listeners between tests.
  const listeners = vi.spyOn(document, 'addEventListener').mockImplementation(() => undefined);
  await import('@/options/options');
  const initialize = listeners.mock.calls.find(([type]) => type === 'DOMContentLoaded')?.[1] as EventListener;
  await initialize(new Event('DOMContentLoaded'));
}

it('opens Chrome shortcuts and saves other settings without the old shortcut fields', async () => {
  await initializeOptions();
  expect(document.getElementById('backwardShortcut')).toBeNull();
  expect(document.getElementById('forwardShortcut')).toBeNull();

  document.getElementById('shortcutSettingsBtn')!.click();
  expect(createTab).toHaveBeenCalledWith({ url: 'chrome://extensions/shortcuts' });

  document.getElementById('saveBtn')!.click();
  await vi.waitFor(() => expect(writeSettings).toHaveBeenCalledOnce());
  expect(writeSettings.mock.calls[0][0]).toEqual({
    tabyjourney_settings: {
      maxHistorySize: 200,
      removeClosedTabs: false,
      separateByWindow: false,
      enableMouseGesture: true,
      showNotification: true,
    },
  });
});

it('keeps Chrome shortcuts accessible when extension settings cannot load', async () => {
  readSettings.mockImplementation(() => { throw new Error('Storage unavailable'); });
  await initializeOptions();

  document.getElementById('shortcutSettingsBtn')!.click();
  expect(createTab).toHaveBeenCalledWith({ url: 'chrome://extensions/shortcuts' });
});

it('shows a manual address when Chrome cannot open shortcut settings', async () => {
  createTab.mockRejectedValue(new Error('Cannot open tab'));
  await initializeOptions();

  document.getElementById('shortcutSettingsBtn')!.click();
  await vi.waitFor(() => expect(document.getElementById('shortcutStatus')!.textContent)
    .toContain('Open chrome://extensions/shortcuts manually.'));
});
