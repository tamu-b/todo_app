# Todo App

勉強用の Todo アプリ

## 使用技術

- Nest.js
- Next.js
- Mantine
- Prisma
- MySQL
- Docker Compose

## プロジェクト構成

```text
.
├── backend/   # Nest.js + Prisma によるAPIサーバー
├── frontend/  # Next.js + Mantine によるフロントエンド
└── db/        # DB初期化用スクリプト
```

## 初期設定

### 前提

- Docker / Docker Compose

### 手順

1. リポジトリのクローン

   ```bash
   git clone <このリポジトリのURL>
   cd todo_app
   ```

2. 初期設定スクリプトの実行

   ```bash
   ./init.sh
   ```

   `.env` / `backend/.env` の作成、コンテナの起動、依存パッケージのインストール、Prisma Client生成、DBマイグレーションをまとめて実行します。
   （`.env` の値（DB名・ユーザー・パスワードなど）を変更したい場合は、スクリプト実行後に `.env` を編集し `docker compose up -d` を再実行してください）

3. アプリケーションサーバーの起動

   ```bash
   docker compose exec backend npm run start:dev
   docker compose exec frontend npm run dev
   ```

4. 動作確認
   - フロントエンド: http://localhost:3000
   - バックエンドAPI: http://localhost:8080
   - Storybook: http://localhost:6006
