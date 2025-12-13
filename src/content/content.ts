/**
 * Content Script for keyboard shortcuts and mouse gesture detection
 *
 * Keyboard shortcuts:
 * - Default: Alt+[ / Alt+] (customizable in settings)
 *
 * Mouse gestures:
 * - Shift + Mouse Back Button → Backward
 * - Shift + Mouse Forward Button → Forward
 */

import type { KeyboardShortcut, Settings } from '@/types/history';
import { loadSettings } from '@utils/settings';

// Mouse button constants
const MOUSE_BUTTON_BACK = 3;
const MOUSE_BUTTON_FORWARD = 4;

// Keyboard shortcut settings (global variables)
let backwardShortcut: KeyboardShortcut;
let forwardShortcut: KeyboardShortcut;

/**
 * Initialize settings
 */
async function initializeSettings(): Promise<void> {
  const settings: Settings = await loadSettings();
  backwardShortcut = settings.backwardShortcut;
  forwardShortcut = settings.forwardShortcut;
  console.log('[TabyJourney] Keyboard shortcuts loaded:', {
    backward: backwardShortcut,
    forward: forwardShortcut,
  });
}

/**
 * Check if key event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  return (
    event.code === shortcut.key &&
    event.altKey === shortcut.alt &&
    event.ctrlKey === shortcut.ctrl &&
    event.shiftKey === shortcut.shift &&
    event.metaKey === shortcut.meta
  );
}

/**
 * Keyboard shortcut handler
 */
function handleKeyboard(event: KeyboardEvent): void {
  // Skip if settings not loaded
  if (!backwardShortcut || !forwardShortcut) {
    return;
  }

  // Disable in input fields
  const target = event.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  let messageType: string | null = null;

  // Match backward shortcut
  if (matchesShortcut(event, backwardShortcut)) {
    messageType = 'backward';
    event.preventDefault();
    event.stopPropagation();
  }
  // Match forward shortcut
  else if (matchesShortcut(event, forwardShortcut)) {
    messageType = 'forward';
    event.preventDefault();
    event.stopPropagation();
  }

  // Send message
  if (messageType) {
    try {
      chrome.runtime.sendMessage({ type: messageType }, (_response) => {
        if (chrome.runtime.lastError) {
          console.error('[TabyJourney] Failed to send message:', chrome.runtime.lastError);
          console.error('[TabyJourney] Please reload this page (⌘R) after updating the extension');
        } else {
          console.log('[TabyJourney] Keyboard shortcut executed:', messageType);
        }
      });
    } catch (error) {
      console.error('[TabyJourney] Extension context invalidated');
      console.error('[TabyJourney] Please reload this page (⌘R)');
    }
  }
}

/**
 * Mouse button event handler
 */
function handleMouseButton(event: MouseEvent): void {
  // Ignore if Shift key is not pressed
  if (!event.shiftKey) {
    return;
  }

  let messageType: string | null = null;

  // Mouse back button
  if (event.button === MOUSE_BUTTON_BACK) {
    messageType = 'mouseBackward';
    event.preventDefault();
    event.stopPropagation();
  }
  // Mouse forward button
  else if (event.button === MOUSE_BUTTON_FORWARD) {
    messageType = 'mouseForward';
    event.preventDefault();
    event.stopPropagation();
  }

  // Send message
  if (messageType) {
    try {
      chrome.runtime.sendMessage({ type: messageType }, (_response) => {
        if (chrome.runtime.lastError) {
          console.error('[TabyJourney] Failed to send message:', chrome.runtime.lastError);
          console.error('[TabyJourney] Please reload this page (⌘R) after updating the extension');
        } else {
          console.log('[TabyJourney] Mouse gesture executed:', messageType);
        }
      });
    } catch (error) {
      console.error('[TabyJourney] Extension context invalidated');
      console.error('[TabyJourney] Please reload this page (⌘R)');
    }
  }
}

/**
 * Disable context menu (prevent accidental actions)
 */
function handleContextMenu(event: MouseEvent): void {
  // Disable context menu for Shift + Mouse back/forward buttons
  if (
    event.shiftKey &&
    (event.button === MOUSE_BUTTON_BACK || event.button === MOUSE_BUTTON_FORWARD)
  ) {
    event.preventDefault();
  }
}

// Register event listeners
// Capture keyboard shortcuts on keydown
document.addEventListener('keydown', handleKeyboard, true);

// Capture mouse gestures on mousedown
document.addEventListener('mousedown', handleMouseButton, true);
document.addEventListener('contextmenu', handleContextMenu, true);

// Initialize settings
initializeSettings().then(() => {
  console.log('='.repeat(60));
  console.log('[TabyJourney] Content script loaded!');
  console.log('[TabyJourney] Keyboard shortcuts are customizable in settings');
  console.log('[TabyJourney] Mouse gestures enabled');
  console.log('='.repeat(60));
});
