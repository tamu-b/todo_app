#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> 環境変数ファイルを作成しています"
[ -f .env ] || cp .env.example .env
[ -f backend/.env ] || cp backend/.env.example backend/.env

echo "==> コンテナを起動しています"
docker compose up -d

echo "==> 依存パッケージをインストールしています"
docker compose exec backend npm install
docker compose exec frontend npm install
echo ">= Prisma Clientを生成しています"
docker compose exec backend npm run prisma:generate
echo "==> DBマイグレーションを実行しています"
docker compose exec backend npm run migrate

echo "==> 初期設定が完了しました"
