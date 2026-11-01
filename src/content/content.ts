/**
 * Detect Shift + mouse back/forward gestures on supported pages.
 * Keyboard shortcuts are handled by Chrome commands in the background worker.
 */
const MOUSE_BUTTON_BACK = 3;
const MOUSE_BUTTON_FORWARD = 4;

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

document.addEventListener('mousedown', handleMouseButton, true);
document.addEventListener('contextmenu', handleContextMenu, true);

export {};
