# TabyJourney Development Commands

# デフォルトコマンド: ヘルプを表示
default:
    @just --list

# 依存パッケージをインストール
install:
    npm install

# 開発サーバーを起動（ホットリロード）
dev:
    npm run dev

# プロダクションビルド
build:
    npm run build

# ビルド成果物を削除
clean:
    rm -rf dist node_modules/.vite

# テストを実行
test:
    npm run test

# テストを監視モードで実行
test-watch:
    npm run test:watch

# カバレッジ付きテストを実行
test-coverage:
    npm run test:coverage

# 型チェックを実行
type-check:
    npm run type-check

# ESLintで静的解析
lint:
    npm run lint

# ESLintで自動修正
lint-fix:
    npm run lint -- --fix

# すべてのチェックを実行（CI用）
check: type-check lint test

# 完全なクリーンビルド
rebuild: clean install build

# Chrome拡張機能を読み込むための説明を表示
chrome-load:
    @echo "Chrome拡張機能の読み込み手順:"
    @echo "1. chrome://extensions/ を開く"
    @echo "2. 「デベロッパーモード」を有効にする"
    @echo "3. 「パッケージ化されていない拡張機能を読み込む」をクリック"
    @echo "4. このプロジェクトの dist/ ディレクトリを選択"
