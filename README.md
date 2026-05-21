<div align="center">

<br />

```
███╗   ██╗ █████╗ ██╗    ██╗ █████╗ ██╗   ██╗ █████╗ ██╗  ████████╗
████╗  ██║██╔══██╗██║    ██║██╔══██╗██║   ██║██╔══██╗██║  ╚══██╔══╝
██╔██╗ ██║███████║██║ █╗ ██║███████║██║   ██║███████║██║     ██║   
██║╚██╗██║██╔══██║██║███╗██║██╔══██║╚██╗ ██╔╝██╔══██║██║     ██║   
██║ ╚████║██║  ██║╚███╔███╔╝██║  ██║ ╚████╔╝ ██║  ██║███████╗██║   
╚═╝  ╚═══╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝   
```

**Sistem Manajemen Aset Sekolah — Modern, Cepat, dan Andal**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00E5FF?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-violet)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

<br/>

![NawaVault Banner](https://placehold.co/900x300/7c3aed/ffffff?text=NawaVault+—+Asset+Management+System&font=raleway)

</div>

---

## ✨ Tentang NawaVault

**NawaVault** adalah platform manajemen aset modern yang dirancang khusus untuk institusi pendidikan. Dibangun dengan teknologi terkini, NawaVault memungkinkan pengelolaan inventaris sekolah menjadi lebih transparan, efisien, dan terdigitalisasi sepenuhnya.

> *"Dari lembar kertas yang mudah hilang, menuju sistem digital yang bisa dipercaya."*

### 🎯 Mengapa NawaVault?

Banyak sekolah masih mengelola aset secara manual — buku catatan, spreadsheet, atau sistem yang usang. NawaVault hadir untuk mengubah itu semua: QR code tertempel di fisik aset, scan dengan kamera HP, dan peminjaman tercatat secara real-time. Sesederhana itu.

---

## 🚀 Fitur Unggulan

| Fitur | Deskripsi |
|-------|-----------|
| 🏷️ **QR Code Pintar** | Setiap aset memiliki QR code unik. Scan dari luar aplikasi pun bisa langsung meminjam. |
| 📱 **Scan Eksternal** | Pengguna yang scan via Google Lens / kamera HP langsung diarahkan ke halaman peminjaman. |
| 📍 **Tracking GPS** | Lokasi peminjam dicatat secara otomatis saat transaksi berlangsung. |
| 👥 **Multi-Role** | Dukungan role `admin`, `operator`, dan `member` dengan hak akses berbeda. |
| 📊 **Dashboard Analitik** | Statistik real-time: aset tersedia, dipinjam, overdue, dan riwayat transaksi. |
| 📄 **Export Laporan** | Export data peminjaman ke PDF dengan satu klik. |
| 🔐 **Autentikasi Aman** | Login berbasis email + password dengan sesi terenkripsi (NextAuth.js). |
| 🌗 **UI Premium** | Desain glassmorphism modern dengan animasi halus dan responsif di semua perangkat. |

---

## 🏗️ Arsitektur Sistem

```
nawa-vault/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Halaman publik (login, register, forgot-password)
│   ├── admin/                  # Panel administrasi
│   ├── assets/                 # Manajemen aset (list, detail, tambah, edit)
│   ├── borrow/[assetId]/       # Halaman peminjaman publik (via QR eksternal)
│   ├── dashboard/              # Dashboard utama pengguna
│   ├── loans/                  # Manajemen peminjaman
│   ├── scan/                   # Halaman scan QR internal
│   └── api/                    # REST API endpoints
│       ├── auth/               # NextAuth + register
│       ├── assets/             # CRUD aset + QR generation
│       ├── loans/              # CRUD peminjaman + pengembalian
│       ├── public/             # Endpoint publik (tanpa autentikasi)
│       └── export/             # Export PDF
├── components/
│   ├── layout/                 # Navbar, Sidebar
│   └── shared/                 # Logo, QRLabel, ScannerView, dll
├── db/
│   ├── schema.ts               # Skema database (Drizzle ORM)
│   └── index.ts                # Koneksi database
└── lib/
    ├── auth.ts                 # Konfigurasi NextAuth
    └── utils.ts                # Utility functions
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** — React framework dengan App Router
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type safety di seluruh codebase
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications
- **[Framer Motion](https://www.framer.com/motion/)** — Animasi

### Backend & Database
- **[Neon PostgreSQL](https://neon.tech/)** — Serverless PostgreSQL
- **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe ORM
- **[NextAuth.js](https://next-auth.js.org/)** — Autentikasi
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Password hashing

### Tools & Utilities
- **[html5-qrcode](https://github.com/mebjas/html5-qrcode)** — QR scanner berbasis kamera
- **[qrcode](https://github.com/soldair/node-qrcode)** — QR code generator
- **[jsPDF](https://github.com/parallax/jsPDF)** — Export laporan PDF

---

## ⚡ Memulai

### Prasyarat

Pastikan kamu sudah memiliki:
- **Node.js** `>= 18.x`
- **npm** atau **yarn**
- Akun **[Neon](https://neon.tech/)** (database PostgreSQL gratis)

### Instalasi

**1. Clone repositori**
```bash
git clone https://github.com/your-org/nawa-vault.git
cd nawa-vault
```

**2. Install dependensi**
```bash
npm install
```

**3. Konfigurasi environment**
```bash
cp .env.example .env.local
```

Isi file `.env.local` dengan nilai yang sesuai:
```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Optional: URL produksi untuk QR code
# NEXT_PUBLIC_APP_URL=https://nawavault.your-domain.com
```

**4. Jalankan migrasi database**
```bash
npx drizzle-kit push
```

**5. (Opsional) Isi data awal**
```bash
npx ts-node db/seed.ts
```

**6. Jalankan server pengembangan**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser. 🎉

---

## 🔑 Akun Default

Setelah menjalankan seed, kamu bisa login menggunakan akun berikut:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nawavault.id` | `admin123` |
| Operator | `operator@nawavault.id` | `operator123` |

> ⚠️ **Penting:** Segera ganti password default setelah pertama kali login di lingkungan produksi.

---

## 📡 API Reference

### Endpoint Publik (Tanpa Autentikasi)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/public/assets/:assetId` | Info aset publik (digunakan halaman borrow) |

### Endpoint Terproteksi

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/assets` | Daftar semua aset |
| `POST` | `/api/assets` | Tambah aset baru |
| `GET` | `/api/assets/:id` | Detail aset |
| `PUT` | `/api/assets/:id` | Update aset |
| `DELETE` | `/api/assets/:id` | Hapus aset |
| `GET` | `/api/assets/:id/qr` | Generate QR code (PNG) |
| `GET` | `/api/loans` | Daftar peminjaman |
| `POST` | `/api/loans` | Buat peminjaman baru |
| `POST` | `/api/loans/return` | Kembalikan aset |

---

## 🌐 Alur QR Code Eksternal

Salah satu fitur andalan NawaVault adalah kemampuan meminjam aset hanya dengan scan QR code menggunakan kamera HP atau Google Lens — tanpa perlu membuka aplikasi terlebih dahulu.

```
[QR Code tertempel di aset]
        ↓ Scan
[Google Lens / Kamera HP]
        ↓ Redirect
[nawavault.id/borrow/NW-001]
        ↓
┌─────────────────────┐
│  Sudah login?       │
│                     │
│  Ya  → Info aset +  │
│        Tombol Pinjam│
│                     │
│  Tidak → Login /    │
│          Daftar     │
└─────────────────────┘
        ↓ Setelah login
[Kembali ke halaman borrow]
        ↓
[Peminjaman berhasil ✅]
```

---

## 🧪 Menjalankan Tes

```bash
# Lint
npm run lint

# Build production (verifikasi tidak ada error)
npm run build
```

---

## 🚢 Deployment

NawaVault dioptimalkan untuk deploy ke **[Vercel](https://vercel.com/)**:

```bash
npm i -g vercel
vercel --prod
```

Pastikan environment variables sudah dikonfigurasi di dashboard Vercel. Khususnya:
- `DATABASE_URL` — Connection string Neon PostgreSQL
- `NEXTAUTH_SECRET` — Random string minimal 32 karakter
- `NEXTAUTH_URL` — URL produksi aplikasi (contoh: `https://nawavault.vercel.app`)

---

## 🤝 Berkontribusi

Kami sangat terbuka terhadap kontribusi! Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan lengkapnya.

**Cara cepat berkontribusi:**
1. Fork repositori ini
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push ke branch: `git push origin feat/nama-fitur`
5. Buat Pull Request 🚀

---

## 🛡️ Keamanan

Temukan celah keamanan? Jangan buat issue publik. Baca [SECURITY.md](SECURITY.md) untuk cara melaporkan secara bertanggung jawab.

---

## 📋 Roadmap

- [ ] 📲 Progressive Web App (PWA) support
- [ ] 🔔 Notifikasi push untuk aset yang hampir jatuh tempo
- [ ] 📈 Laporan analitik lebih mendalam (per kategori, per pengguna)
- [ ] 🌍 Multi-bahasa (i18n)
- [ ] 🔗 Integrasi dengan sistem informasi sekolah (SIS)
- [ ] 📷 Upload foto aset langsung dari kamera
- [ ] 🤖 Deteksi anomali peminjaman berbasis AI

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail lengkapnya.

---

## 💜 Tim NawaVault

Dibangun dengan ❤️ oleh tim yang percaya bahwa teknologi bisa membuat pendidikan lebih baik.

<div align="center">

**[Website](https://nawavault.id)** · **[Dokumentasi](https://docs.nawavault.id)** · **[Laporkan Bug](https://github.com/your-org/nawa-vault/issues)** · **[Request Fitur](https://github.com/your-org/nawa-vault/discussions)**

<br/>

*NawaVault — Karena setiap aset sekolah berharga* ✨

</div>