import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('uses only Chrome commands for keyboard navigation and retains mouse gestures', async () => {
  const sendMessage = vi.fn();
  const readSettings = vi.fn();
  vi.stubGlobal('chrome', {
    runtime: { sendMessage },
    storage: { sync: { get: readSettings } },
  });
  await import('@/content/content');

  for (const code of ['BracketLeft', 'BracketRight']) {
    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      code, ctrlKey: true, metaKey: true, bubbles: true,
    }));
    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      code, altKey: true, bubbles: true,
    }));
  }

  expect(sendMessage).not.toHaveBeenCalled();
  expect(readSettings).not.toHaveBeenCalled();

  document.body.dispatchEvent(new MouseEvent('mousedown', { button: 3, bubbles: true }));
  expect(sendMessage).not.toHaveBeenCalled();

  document.body.dispatchEvent(new MouseEvent('mousedown', {
    button: 3, shiftKey: true, bubbles: true,
  }));
  expect(sendMessage).toHaveBeenLastCalledWith({ type: 'mouseBackward' }, expect.any(Function));

  document.body.dispatchEvent(new MouseEvent('mousedown', {
    button: 4, shiftKey: true, bubbles: true,
  }));
  expect(sendMessage).toHaveBeenLastCalledWith({ type: 'mouseForward' }, expect.any(Function));
  expect(sendMessage).toHaveBeenCalledTimes(2);
});
