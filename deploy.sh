#!/bin/bash

echo "🔍 Mencari hasil build terakhir yang sukses di GitHub..."
RUN_ID=$(gh run list --branch main --status success --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -z "$RUN_ID" ] || [ "$RUN_ID" == "null" ]; then
  echo "❌ Tidak ditemukan hasil build yang sukses! Pastikan GitHub Actions sudah selesai (centang hijau) sebelum menjalankan script ini."
  exit 1
fi

echo "☁️  Mendownload hasil build (Run ID: $RUN_ID)..."
# Bersihkan sisa temp lama
rm -rf .gh-temp build.tar.gz
mkdir -p .gh-temp

# Mengunduh langsung menggunakan RUN_ID agar tidak interaktif (stuck)
gh run download $RUN_ID -n vault-build --dir .gh-temp

echo "📦 Mengekstrak file build (~15MB)..."
mv .gh-temp/build.tar.gz ./
tar -xzf build.tar.gz

echo "🧹 Membersihkan file zip..."
rm -rf .gh-temp build.tar.gz

echo "⚡ Menginstal dependencies lokal dengan Bun..."
bun install

echo "🚀 Merestart aplikasi di PM2..."
pm2 restart vault-web || pm2 start "bun start -H 0.0.0.0" --name "vault-web"

echo "✅ Selesai! Web sudah terupdate."
