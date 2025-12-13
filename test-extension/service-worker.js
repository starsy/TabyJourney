// 最小限のテストケース：Viteを使わない素のJavaScript

console.log('[TEST] Service worker loading...');

// コマンドハンドラー
function handleCommand(command) {
  console.log('='.repeat(50));
  console.log('[TEST] !!!! COMMAND RECEIVED !!!!');
  console.log('[TEST] Command:', command);
  console.log('[TEST] Timestamp:', new Date().toISOString());
  console.log('='.repeat(50));

  alert('Command received: ' + command);
}

// リスナー登録（トップレベル）
chrome.commands.onCommand.addListener(handleCommand);
console.log('[TEST] Command listener registered');

// 登録されているコマンドを確認
chrome.commands.getAll((commands) => {
  console.log('[TEST] Available commands:', commands);
});

console.log('[TEST] Service worker loaded');
