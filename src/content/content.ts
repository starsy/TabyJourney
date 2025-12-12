/**
 * Content Script for mouse gesture detection
 * Shift + マウス戻るボタン → Backward
 * Shift + マウス進むボタン → Forward
 */

// マウスボタンの定数
const MOUSE_BUTTON_BACK = 3;
const MOUSE_BUTTON_FORWARD = 4;

/**
 * マウスボタンイベントハンドラー
 */
function handleMouseButton(event: MouseEvent): void {
  // Shiftキーが押されていない場合は無視
  if (!event.shiftKey) {
    return;
  }

  let messageType: string | null = null;

  // マウス戻るボタン
  if (event.button === MOUSE_BUTTON_BACK) {
    messageType = 'mouseBackward';
    event.preventDefault();
    event.stopPropagation();
  }
  // マウス進むボタン
  else if (event.button === MOUSE_BUTTON_FORWARD) {
    messageType = 'mouseForward';
    event.preventDefault();
    event.stopPropagation();
  }

  // メッセージを送信
  if (messageType) {
    chrome.runtime.sendMessage({ type: messageType }, (_response) => {
      if (chrome.runtime.lastError) {
        console.error('[TabyJourney] Failed to send message:', chrome.runtime.lastError);
      } else {
        console.log('[TabyJourney] Mouse gesture executed:', messageType);
      }
    });
  }
}

/**
 * コンテキストメニューを無効化（誤動作防止）
 */
function handleContextMenu(event: MouseEvent): void {
  // Shift + マウス戻る/進むボタンの場合はコンテキストメニューを無効化
  if (
    event.shiftKey &&
    (event.button === MOUSE_BUTTON_BACK || event.button === MOUSE_BUTTON_FORWARD)
  ) {
    event.preventDefault();
  }
}

// イベントリスナーを登録
// mousedownでキャプチャ（早い段階でイベントを捕捉）
document.addEventListener('mousedown', handleMouseButton, true);
document.addEventListener('contextmenu', handleContextMenu, true);

console.log('[TabyJourney] Content script loaded - mouse gestures enabled');
