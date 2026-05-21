# Kebijakan Keamanan NawaVault

## 🛡️ Komitmen Kami

NawaVault menangani keamanan dengan sangat serius. Kami menghargai komunitas peneliti keamanan dan pengguna yang meluangkan waktu untuk melaporkan kerentanan secara bertanggung jawab. Laporan yang valid akan mendapat pengakuan dan penghargaan dari kami.

---

## 📋 Versi yang Didukung

Kami menyediakan patch keamanan untuk versi-versi berikut:

| Versi | Dukungan Keamanan |
|-------|-------------------|
| `latest` (main) | ✅ Didukung penuh |
| Rilis 3 bulan terakhir | ✅ Mendapat patch keamanan |
| Rilis lebih lama | ❌ Tidak didukung — upgrade diperlukan |

> **Rekomendasi:** Selalu gunakan versi terbaru untuk mendapatkan perlindungan keamanan terkini.

---

## 🔍 Cakupan Laporan Keamanan

### ✅ Dalam Cakupan (In-Scope)

Kami sangat tertarik menerima laporan untuk:

- **Injeksi SQL** atau eksploitasi database
- **Cross-Site Scripting (XSS)** — reflektif, tersimpan, atau berbasis DOM
- **Cross-Site Request Forgery (CSRF)**
- **Bypass autentikasi** atau otorisasi
- **Eskalasi hak akses** (misalnya: pengguna biasa bisa mengakses panel admin)
- **Eksposur data sensitif** (informasi pengguna, credential, dll)
- **Server-Side Request Forgery (SSRF)**
- **Kerentanan pada dependensi** yang aktif digunakan
- **Masalah konfigurasi** yang dapat dieksploitasi
- **Kebocoran informasi** melalui pesan error atau respons API

### ❌ Di Luar Cakupan (Out-of-Scope)

Laporan berikut **tidak** akan diproses:

- Kerentanan yang memerlukan akses fisik ke perangkat pengguna
- Serangan berbasis social engineering terhadap pengguna atau karyawan kami
- Denial of Service (DoS/DDoS)
- Spam atau abuse yang tidak terkait dengan kerentanan teknis
- Bug di layanan pihak ketiga yang tidak kami kendalikan
- Masalah yang hanya memengaruhi browser yang sudah tidak didukung
- Hasil dari automated scanner tanpa bukti eksploitasi nyata
- Self-XSS (pengguna menyerang diri sendiri)
- Missing security headers yang tidak dapat dieksploitasi secara langsung

---

## 📬 Cara Melaporkan Kerentanan

> **⚠️ PENTING:** Jangan pernah melaporkan kerentanan keamanan melalui GitHub Issues publik, forum, atau media sosial.

### Saluran Pelaporan Resmi

**1. Email (Direkomendasikan)**

Kirim laporan ke: **security@nawavault.id**

Gunakan subjek: `[SECURITY] Deskripsi singkat kerentanan`

Sertakan informasi PGP Public Key kami jika kamu ingin mengenkripsi laporan (tersedia di [nawavault.id/pgp-key.txt](https://nawavault.id/pgp-key.txt)).

**2. Private Security Advisory (GitHub)**

Untuk repositori publik, gunakan fitur [GitHub Private Security Advisory](https://github.com/your-org/nawa-vault/security/advisories/new).

---

## 📝 Template Laporan Keamanan

Gunakan template berikut untuk memastikan laporan kamu dapat diproses dengan cepat:

```
## Ringkasan
Deskripsi singkat kerentanan (1-2 kalimat).

## Tingkat Keparahan
[ ] Kritis (Critical) — Eksploitasi tanpa autentikasi, dampak luas
[ ] Tinggi (High) — Eksploitasi dengan autentikasi minimal, data sensitif bocor
[ ] Sedang (Medium) — Butuh kondisi tertentu, dampak terbatas
[ ] Rendah (Low) — Dampak minimal atau sulit dieksploitasi

## Deskripsi Teknis
Jelaskan secara teknis bagaimana kerentanan ini bekerja.

## Langkah Reproduksi
1. ...
2. ...
3. ...

## Dampak Potensial
Apa yang bisa dilakukan penyerang jika mengeksploitasi kerentanan ini?

## Bukti (Proof of Concept)
Sertakan screenshot, video, atau kode PoC yang membuktikan kerentanan.
PENTING: Jangan merusak data nyata atau mengganggu pengguna lain saat pengujian.

## Saran Perbaikan (Opsional)
Jika kamu memiliki saran bagaimana memperbaikinya.

## Informasi Penemu
Nama / Alias: 
Website / Profil (opsional): 
Preferensi pengakuan (ingin dicantumkan di Hall of Fame?): Ya / Tidak / Anonim
```

---

## ⏱️ Proses & Timeline

Setelah menerima laporan keamanan, kami berkomitmen untuk:

| Tahap | Target Waktu |
|-------|--------------|
| Konfirmasi penerimaan laporan | **24 jam** |
| Asesmen awal dan klasifikasi keparahan | **72 jam** |
| Update status investigasi | **7 hari** |
| Resolusi untuk kerentanan Kritis | **14 hari** |
| Resolusi untuk kerentanan Tinggi | **30 hari** |
| Resolusi untuk kerentanan Sedang/Rendah | **90 hari** |
| Publikasi advisory (setelah patch dirilis) | **Setelah patch + 7 hari** |

> **Catatan:** Timeline dapat bervariasi tergantung kompleksitas kerentanan. Kami akan selalu mengkomunikasikan perkembangan secara proaktif.

---

## 🤝 Responsible Disclosure

Kami memohon agar kamu mengikuti prinsip **Responsible Disclosure**:

### Yang kami minta dari peneliti:

- **Jangan** mengeksploitasi kerentanan melampaui yang diperlukan untuk membuktikan keberadaannya
- **Jangan** mengakses, memodifikasi, atau menghapus data pengguna lain
- **Jangan** melakukan serangan pada infrastruktur produksi; gunakan akun pengujian
- **Jangan** melakukan pengujian yang dapat memengaruhi ketersediaan layanan (DoS)
- **Berikan** waktu yang wajar bagi kami untuk memperbaiki sebelum disclosure publik
- **Koordinasikan** waktu disclosure dengan tim kami

### Yang kami janjikan:

- Merespons laporan kamu **tepat waktu**
- **Tidak mengambil tindakan hukum** terhadap peneliti yang mengikuti panduan ini
- **Mengakui kontribusi** kamu (jika diinginkan) dalam catatan rilis dan Hall of Fame
- **Berkoordinasi** dengan kamu tentang waktu disclosure publik
- Berupaya menyelesaikan masalah **sebelum disclosure publik**

---

## 🏆 Hall of Fame

Kami berterima kasih kepada peneliti keamanan berikut yang telah membantu membuat NawaVault lebih aman:

*Jadilah yang pertama! Kontribusi kamu akan dicantumkan di sini.*

<!-- Format: Nama/Alias — Deskripsi temuan — Bulan Tahun -->

---

## 🔐 Praktik Keamanan Internal

Untuk transparansi, berikut langkah-langkah keamanan yang telah kami terapkan:

- ✅ **Password hashing** menggunakan bcrypt dengan salt round yang sesuai
- ✅ **Session management** melalui NextAuth.js dengan JWT terenkripsi
- ✅ **Input validation** di sisi server untuk semua API endpoint
- ✅ **SQL injection protection** melalui Drizzle ORM (parameterized queries)
- ✅ **HTTPS only** di lingkungan produksi
- ✅ **Environment secrets** tidak pernah di-commit ke repositori
- ✅ **Role-based access control** (admin, operator, member)
- ✅ **Database connection** melalui SSL (Neon PostgreSQL)
- 🔄 **Dependency audit** — dijalankan secara berkala (`npm audit`)
- 🔄 **Security headers** — sedang dalam proses implementasi

---

## 📚 Referensi

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Guidelines](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [Contributor Covenant](https://www.contributor-covenant.org/)

---

## 📞 Kontak

| Keperluan | Kontak |
|-----------|--------|
| Laporan keamanan | security@nawavault.id |
| Pertanyaan umum | hello@nawavault.id |
| Darurat keamanan | +62-xxx-xxxx-xxxx (tersedia 24/7) |

---

<div align="center">

*Keamanan bukan produk, melainkan sebuah proses.* — Bruce Schneier

**Versi kebijakan ini:** 1.0.0 | **Terakhir diperbarui:** Mei 2026

</div>
