#!/bin/bash

echo "🔄 Menghapus artifact lama jika ada..."
rm -f build.tar.gz

echo "☁️  Mendownload hasil build terbaru dari GitHub Actions..."
# Mengunduh artifact bernama 'vault-build' menggunakan GitHub CLI
gh run download -n vault-build --dir .

echo "📦 Mengekstrak file build..."
tar -xzf build.tar.gz

echo "🧹 Membersihkan file zip..."
rm build.tar.gz

echo "🚀 Merestart aplikasi di PM2..."
pm2 restart vault-web || pm2 start "bun start -H 0.0.0.0" --name "vault-web"

echo "✅ Selesai! Web sudah terupdate."
