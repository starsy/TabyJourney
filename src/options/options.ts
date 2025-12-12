import { loadSettings, saveSettings, getDefaultSettings } from '@/utils/settings';
import type { Settings } from '@/types/history';

/**
 * 設定値をUIに反映
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
 * UIから設定値を取得
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
 * 保存ステータスを表示
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
 * 設定を保存
 */
async function handleSave(): Promise<void> {
  try {
    const settings = getSettingsFromUI();
    await saveSettings(settings);
    showSaveStatus('設定を保存しました', 'success');
  } catch (error) {
    console.error('[TabyJourney] Failed to save settings:', error);
    showSaveStatus('設定の保存に失敗しました', 'error');
  }
}

/**
 * デフォルト設定に戻す
 */
async function handleReset(): Promise<void> {
  const confirmed = confirm('設定をデフォルトに戻しますか？');
  if (!confirmed) return;

  try {
    const defaultSettings = getDefaultSettings();
    await saveSettings(defaultSettings);
    renderSettings(defaultSettings);
    showSaveStatus('設定をデフォルトに戻しました', 'success');
  } catch (error) {
    console.error('[TabyJourney] Failed to reset settings:', error);
    showSaveStatus('設定のリセットに失敗しました', 'error');
  }
}

/**
 * 初期化
 */
async function initialize(): Promise<void> {
  try {
    const settings = await loadSettings();
    renderSettings(settings);

    // 保存ボタン
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', handleSave);
    }

    // リセットボタン
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }
  } catch (error) {
    console.error('[TabyJourney] Failed to initialize options page:', error);
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', initialize);
