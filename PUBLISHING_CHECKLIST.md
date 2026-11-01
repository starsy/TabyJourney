# Chrome Web Store 公開チェックリスト

TabyJourneyをChrome Web Storeに公開するための最終チェックリストです。

## 📋 事前準備

### 1. Chrome Web Store Developer アカウント

- [ ] Chrome Web Store Developer Consoleにアクセス: https://chrome.google.com/webstore/devconsole/
- [ ] 5ドルの開発者登録料を支払い済み
- [ ] アカウント認証完了

### 2. 必須ファイル確認

- [x] `manifest.json` - 拡張機能の設定ファイル
- [x] `icons/` - 3サイズのアイコン (16x16, 48x48, 128x128)
- [x] `PRIVACY_POLICY.md` - プライバシーポリシー
- [x] `README.md` - ドキュメント
- [x] `LICENSE` - MITライセンス
- [x] `STORE_LISTING.md` - ストア説明文（コピペ用）

### 3. manifest.json の最終確認

- [ ] `author` フィールドを実際の名前に更新
- [ ] `homepage_url` を実際のGitHub URLに更新
- [ ] バージョン番号が正しい (現在: 0.1.1)
- [ ] すべての`permissions`が必要最小限
- [ ] アイコンパスが正しい

**更新が必要な箇所:**
```json
"author": "Your Name",  // ← 実際の名前に変更
"homepage_url": "https://github.com/yourusername/TabyJourney",  // ← 実際のURLに変更
```

### 4. プライバシーポリシーの公開

- [ ] `PRIVACY_POLICY.md`をGitHubリポジトリにプッシュ
- [ ] プライバシーポリシーのURLを確認: `https://github.com/yourusername/TabyJourney/blob/main/PRIVACY_POLICY.md`
- [ ] プライバシーポリシーのURLをメモ（ストア登録時に必要）

### 5. スクリーンショット準備

Chrome Web Storeには**最低1枚、推奨3-5枚**のスクリーンショットが必要です。

**推奨サイズ**: 1280x800 または 640x400

**撮影すべき画面:**

1. **タブ履歴ポップアップ**
   - 拡張機能アイコンをクリックして履歴を表示
   - 現在位置がハイライトされている状態
   - 複数のタブが履歴に表示されている

2. **設定画面**
   - オプションページを開く
   - キーボードショートカットの設定が見える
   - 各種オプションが確認できる

3. **動作イメージ**
   - Alt+[やAlt+]でタブが切り替わる様子
   - （可能ならキーボードオーバーレイ表示）

4. **使用例** (オプション)
   - 実際のブラウジング中に使っている様子
   - 複数タブを管理している画面

5. **マウスジェスチャー** (オプション)
   - Shift+マウスボタンの説明

**スクリーンショット撮影方法:**
- macOS: `Cmd+Shift+4` で範囲指定スクリーンショット
- Chrome DevTools: `Cmd+Shift+P` → "Capture screenshot"

- [ ] スクリーンショット1を準備（タブ履歴ポップアップ）
- [ ] スクリーンショット2を準備（設定画面）
- [ ] スクリーンショット3を準備（動作イメージ）
- [ ] （オプション）追加スクリーンショット

### 6. プロモーション画像（オプション）

**サイズ**: 440x280

- [ ] プロモーション用タイル画像を作成（推奨だが必須ではない）

## 🔧 ビルドとパッケージング

### 7. 最終ビルド

```bash
# テストを実行
just test

# 型チェック
just type-check

# プロダクションビルド
just build
```

- [ ] すべてのテストが通過
- [ ] 型エラーがない
- [ ] ビルドが成功

### 8. 動作確認

- [ ] `dist/`ディレクトリをChromeに読み込んで動作確認
- [ ] すべての機能が正常に動作
- [ ] キーボードショートカット（Alt+[/]）が動作
- [ ] マウスジェスチャーが動作
- [ ] ポップアップが正常に表示
- [ ] 設定画面が正常に動作
- [ ] タブナビゲーション（Backward/Forward）が動作
- [ ] コンソールにエラーがない

### 9. パッケージ作成

```bash
# Chrome Web Store用のzipファイルを作成
just package
```

- [ ] `tabyjourney.zip`が生成された
- [ ] zipファイルのサイズを確認（通常50KB以下）

## 📤 Chrome Web Store 登録

### 10. Developer Dashboard での登録

1. **新しいアイテムをアップロード**
   - [ ] https://chrome.google.com/webstore/devconsole/ にアクセス
   - [ ] 「新しいアイテム」ボタンをクリック
   - [ ] `tabyjourney.zip`をアップロード

2. **ストアリスティング情報入力**

   **基本情報:**
   - [ ] 拡張機能名: `TabyJourney`
   - [ ] 概要（132文字以内）: `STORE_LISTING.md`からコピー
   - [ ] 詳細説明: `STORE_LISTING.md`からコピー
   - [ ] カテゴリ: `生産性向上ツール` または `Productivity`
   - [ ] 言語: `日本語` and/or `English`

   **アイコンとスクリーンショット:**
   - [ ] アイコン128x128をアップロード（自動検出されるはず）
   - [ ] スクリーンショット（最低1枚）をアップロード
   - [ ] （オプション）プロモーション用タイルをアップロード

   **プライバシー:**
   - [ ] プライバシーポリシーURL: `https://github.com/yourusername/TabyJourney/blob/main/PRIVACY_POLICY.md`
   - [ ] 権限の正当性を説明（自動的に求められる）
     - `tabs`: タブ情報の取得とナビゲーション
     - `storage`: 設定と履歴のローカル保存
     - `<all_urls>`: キーボードショートカットの有効化

   **サポート情報:**
   - [ ] サポートURL: `https://github.com/yourusername/TabyJourney/issues`
   - [ ] ホームページURL: `https://github.com/yourusername/TabyJourney`

3. **配布設定**
   - [ ] 公開範囲: `公開` または `非公開（テストユーザーのみ）`
   - [ ] 国/地域の選択
   - [ ] 価格設定: `無料`

4. **審査に提出**
   - [ ] すべての必須項目を入力
   - [ ] 「審査に提出」ボタンをクリック

## 🎯 審査後

### 11. 審査待ち

- Chrome Web Storeの審査には通常**数時間～数日**かかります
- 審査状況は Developer Dashboard で確認できます
- メールで通知が届きます

### 12. 審査承認後

- [ ] 公開を確認: `https://chrome.google.com/webstore/detail/[extension-id]`
- [ ] README.mdのインストールリンクを更新
- [ ] GitHubリポジトリにリリースタグを作成 (`v0.1.1`)
- [ ] SNSやブログで告知（オプション）

### 13. アップデート管理

今後のアップデート手順:

1. `manifest.json`のバージョンを更新（例: 0.1.0 → 0.2.0）
2. `just package`で新しいzipを作成
3. Developer Dashboardで新バージョンをアップロード
4. 審査に提出

## 📝 補足情報

### よくある審査却下理由

- プライバシーポリシーが不十分
- 権限の正当性が説明されていない
- スクリーンショットがない/不適切
- 説明文が不明瞭
- manifest.jsonに問題がある

### 注意事項

- **開発版とビルド版の違い**: 開発時は`src/`を直接参照していますが、公開するのは`dist/`のビルド版です
- **Chrome Sync**: `chrome.storage.sync`を使用しているため、ユーザーの設定は複数デバイス間で同期されます
- **自動更新**: Chrome Web Storeで公開すると、ユーザーの拡張機能は自動的に最新版に更新されます

### 公開前の最終確認項目

- [ ] manifest.jsonの`author`と`homepage_url`を実際の値に更新
- [ ] プライバシーポリシーをGitHubで公開
- [ ] スクリーンショットを準備
- [ ] すべての機能が動作することを確認
- [ ] テストが全て通過
- [ ] `just package`でzipファイルを生成

---

## 🚀 Quick Start（公開手順概要）

```bash
# 1. テストとビルド
just test && just build

# 2. 動作確認
# chrome://extensions/ で dist/ を読み込んで確認

# 3. manifest.json を更新
# author と homepage_url を実際の値に

# 4. パッケージ作成
just package

# 5. スクリーンショット準備
# 拡張機能を使っている画面をキャプチャ

# 6. Chrome Web Store Developer Dashboard へ
# https://chrome.google.com/webstore/devconsole/
# - tabyjourney.zip をアップロード
# - STORE_LISTING.md から説明文をコピペ
# - スクリーンショットをアップロード
# - プライバシーポリシーURL を設定
# - 審査に提出
```

---

**Good luck with your Chrome extension launch! 🎉**
