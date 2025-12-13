import { loadSettings, saveSettings, getDefaultSettings } from '@/utils/settings';
import type { Settings, KeyboardShortcut } from '@/types/history';

// Global variables for keyboard shortcut settings
let backwardShortcut: KeyboardShortcut;
let forwardShortcut: KeyboardShortcut;

/**
 * Convert KeyboardShortcut to display string
 */
function shortcutToString(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Cmd');

  // Convert key code to readable display
  let keyName = shortcut.key;
  if (keyName === 'BracketLeft') keyName = '[';
  else if (keyName === 'BracketRight') keyName = ']';
  else if (keyName.startsWith('Key')) keyName = keyName.substring(3);
  else if (keyName.startsWith('Digit')) keyName = keyName.substring(5);

  parts.push(keyName);
  return parts.join('+');
}

/**
 * Render settings to UI
 */
function renderSettings(settings: Settings): void {
  const maxHistorySizeInput = document.getElementById('maxHistorySize') as HTMLInputElement;
  const removeClosedTabsCheckbox = document.getElementById('removeClosedTabs') as HTMLInputElement;
  const separateByWindowCheckbox = document.getElementById('separateByWindow') as HTMLInputElement;
  const enableMouseGestureCheckbox = document.getElementById('enableMouseGesture') as HTMLInputElement;
  const showNotificationCheckbox = document.getElementById('showNotification') as HTMLInputElement;
  const backwardShortcutInput = document.getElementById('backwardShortcut') as HTMLInputElement;
  const forwardShortcutInput = document.getElementById('forwardShortcut') as HTMLInputElement;

  if (maxHistorySizeInput) maxHistorySizeInput.value = settings.maxHistorySize.toString();
  if (removeClosedTabsCheckbox) removeClosedTabsCheckbox.checked = settings.removeClosedTabs;
  if (separateByWindowCheckbox) separateByWindowCheckbox.checked = settings.separateByWindow;
  if (enableMouseGestureCheckbox) enableMouseGestureCheckbox.checked = settings.enableMouseGesture;
  if (showNotificationCheckbox) showNotificationCheckbox.checked = settings.showNotification;

  // Reflect keyboard shortcuts
  backwardShortcut = settings.backwardShortcut;
  forwardShortcut = settings.forwardShortcut;
  if (backwardShortcutInput) backwardShortcutInput.value = shortcutToString(backwardShortcut);
  if (forwardShortcutInput) forwardShortcutInput.value = shortcutToString(forwardShortcut);
}

/**
 * Get settings from UI
 */
function getSettingsFromUI(): Settings {
  const maxHistorySizeInput = document.getElementById('maxHistorySize') as HTMLInputElement;
  const removeClosedTabsCheckbox = document.getElementById('removeClosedTabs') as HTMLInputElement;
  const separateByWindowCheckbox = document.getElementById('separateByWindow') as HTMLInputElement;
  const enableMouseGestureCheckbox = document.getElementById('enableMouseGesture') as HTMLInputElement;
  const showNotificationCheckbox = document.getElementById('showNotification') as HTMLInputElement;

  return {
    maxHistorySize: parseInt(maxHistorySizeInput.value, 10),
    removeClosedTabs: removeClosedTabsCheckbox.checked,
    separateByWindow: separateByWindowCheckbox.checked,
    enableMouseGesture: enableMouseGestureCheckbox.checked,
    showNotification: showNotificationCheckbox.checked,
    backwardShortcut: backwardShortcut,
    forwardShortcut: forwardShortcut,
  };
}

/**
 * Show save status message
 */
function showSaveStatus(message: string, type: 'success' | 'error' = 'success'): void {
  const statusElement = document.getElementById('saveStatus');
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.className = `save-status ${type}`;
  statusElement.style.display = 'block';

  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

/**
 * Save settings
 */
async function handleSave(): Promise<void> {
  try {
    const settings = getSettingsFromUI();
    await saveSettings(settings);
    showSaveStatus('Settings saved successfully', 'success');
  } catch (error) {
    console.error('[TabyJourney] Failed to save settings:', error);
    showSaveStatus('Failed to save settings', 'error');
  }
}

/**
 * Setup keyboard shortcut input
 */
function setupShortcutInput(
  inputId: string,
  shortcutSetter: (shortcut: KeyboardShortcut) => void
): void {
  const input = document.getElementById(inputId) as HTMLInputElement;
  if (!input) return;

  input.addEventListener('keydown', (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Cancel with Esc
    if (event.code === 'Escape') {
      input.blur();
      return;
    }

    // Ignore modifier keys only
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
      return;
    }

    // Set new shortcut
    const newShortcut: KeyboardShortcut = {
      key: event.code,
      alt: event.altKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    };

    shortcutSetter(newShortcut);
    input.value = shortcutToString(newShortcut);
    input.blur();
  });

  input.addEventListener('click', () => {
    input.value = 'Press a key...';
  });

  input.addEventListener('blur', () => {
    if (input.value === 'Press a key...') {
      // Restore original value if not changed
      if (inputId === 'backwardShortcut') {
        input.value = shortcutToString(backwardShortcut);
      } else {
        input.value = shortcutToString(forwardShortcut);
      }
    }
  });
}

/**
 * Reset to default settings
 */
async function handleReset(): Promise<void> {
  const confirmed = confirm('Reset settings to default?');
  if (!confirmed) return;

  try {
    const defaultSettings = getDefaultSettings();
    await saveSettings(defaultSettings);
    renderSettings(defaultSettings);
    showSaveStatus('Settings reset to default', 'success');
  } catch (error) {
    console.error('[TabyJourney] Failed to reset settings:', error);
    showSaveStatus('Failed to reset settings', 'error');
  }
}

/**
 * Initialize
 */
async function initialize(): Promise<void> {
  try {
    const settings = await loadSettings();
    renderSettings(settings);

    // Setup keyboard shortcut inputs
    setupShortcutInput('backwardShortcut', (shortcut) => {
      backwardShortcut = shortcut;
    });
    setupShortcutInput('forwardShortcut', (shortcut) => {
      forwardShortcut = shortcut;
    });

    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', handleSave);
    }

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }
  } catch (error) {
    console.error('[TabyJourney] Failed to initialize options page:', error);
  }
}

// Initialize after DOM loaded
document.addEventListener('DOMContentLoaded', initialize);
