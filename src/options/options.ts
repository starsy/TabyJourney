import { loadSettings, saveSettings, getDefaultSettings } from '@/utils/settings';
import type { Settings } from '@/types/history';

/**
 * Render settings to UI
 */
function renderSettings(settings: Settings): void {
  const maxHistorySizeInput = document.getElementById('maxHistorySize') as HTMLInputElement;
  const removeClosedTabsCheckbox = document.getElementById('removeClosedTabs') as HTMLInputElement;
  const separateByWindowCheckbox = document.getElementById('separateByWindow') as HTMLInputElement;
  const enableMouseGestureCheckbox = document.getElementById('enableMouseGesture') as HTMLInputElement;
  const showNotificationCheckbox = document.getElementById('showNotification') as HTMLInputElement;

  if (maxHistorySizeInput) maxHistorySizeInput.value = settings.maxHistorySize.toString();
  if (removeClosedTabsCheckbox) removeClosedTabsCheckbox.checked = settings.removeClosedTabs;
  if (separateByWindowCheckbox) separateByWindowCheckbox.checked = settings.separateByWindow;
  if (enableMouseGestureCheckbox) enableMouseGestureCheckbox.checked = settings.enableMouseGesture;
  if (showNotificationCheckbox) showNotificationCheckbox.checked = settings.showNotification;
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
 * Chrome owns shortcut assignments. Open its settings instead of keeping a second copy.
 */
async function openShortcutSettings(): Promise<void> {
  try {
    await chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  } catch (error) {
    console.error('[TabyJourney] Failed to open shortcut settings:', error);
    const status = document.getElementById('shortcutStatus');
    if (status) {
      status.textContent = 'Cannot open shortcut settings. Open chrome://extensions/shortcuts manually.';
    }
  }
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
  // Keep this button available even if stored settings cannot be loaded.
  document.getElementById('shortcutSettingsBtn')?.addEventListener('click', openShortcutSettings);

  try {
    const settings = await loadSettings();
    renderSettings(settings);

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
