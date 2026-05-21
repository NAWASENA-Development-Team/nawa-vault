# Panduan Berkontribusi ke NawaVault

Terima kasih sudah meluangkan waktu untuk berkontribusi! 🎉

Kami menyambut kontribusi dari siapa saja — baik kamu developer berpengalaman maupun yang baru memulai. Panduan ini akan membantu kamu memahami cara kerja tim kami dan bagaimana kontribusimu bisa diterima dengan lancar.

> Dengan berkontribusi, kamu setuju untuk mematuhi [Code of Conduct](CODE_OF_CONDUCT.md) kami.

---

## 📋 Daftar Isi

- [Cara Melaporkan Bug](#-cara-melaporkan-bug)
- [Cara Mengusulkan Fitur](#-cara-mengusulkan-fitur)
- [Alur Pengembangan](#-alur-pengembangan)
- [Standar Commit](#-standar-commit)
- [Standar Kode](#-standar-kode)
- [Review Pull Request](#-review-pull-request)
- [Setup Lingkungan Pengembangan](#-setup-lingkungan-pengembangan)

---

## 🐛 Cara Melaporkan Bug

Sebelum membuat laporan bug baru, pastikan kamu sudah:

1. **Cek daftar issue yang sudah ada** — mungkin bug yang sama sudah dilaporkan
2. **Coba reproduksi** di versi terbaru dari branch `main`
3. **Kumpulkan informasi** yang diperlukan

### Isi laporan bug yang baik:

```
**Deskripsi Bug**
Jelaskan secara singkat apa yang terjadi.

**Langkah Reproduksi**
1. Buka halaman '...'
2. Klik pada '...'
3. Lihat error di '...'

**Perilaku yang Diharapkan**
Apa yang seharusnya terjadi?

**Screenshot / Video**
Jika memungkinkan, lampirkan bukti visual.

**Environment**
- OS: [contoh: Windows 11, macOS 14]
- Browser: [contoh: Chrome 124, Firefox 125]
- Versi Node.js: [contoh: 20.11.0]
```

> 🔐 Jika kamu menemukan **celah keamanan**, jangan buat issue publik. Baca [SECURITY.md](SECURITY.md) terlebih dahulu.

---

## 💡 Cara Mengusulkan Fitur

Punya ide brilian? Kami ingin mendengarnya!

1. Cek terlebih dahulu apakah fitur serupa sudah ada di **[GitHub Discussions](https://github.com/your-org/nawa-vault/discussions)** atau **Issues**
2. Buka **Discussion** baru dengan label `💡 Feature Request`
3. Jelaskan *masalah* yang ingin diselesaikan, bukan hanya solusinya
4. Sertakan mockup atau sketsa jika ada

Proposal yang baik menjawab pertanyaan:
- **Masalah apa** yang diselesaikan?
- **Siapa** yang akan mendapat manfaat?
- **Bagaimana** fitur ini akan bekerja?
- Apakah ada **alternatif** yang sudah kamu pertimbangkan?

---

## 🔄 Alur Pengembangan

Kami menggunakan model **GitHub Flow** yang sederhana:

```
main (protected)
  └── feat/nama-fitur          ← branch fitur
  └── fix/deskripsi-bug        ← branch perbaikan bug
  └── docs/update-readme       ← branch dokumentasi
  └── refactor/nama-komponen   ← branch refaktor
```

### Langkah-langkah:

**1. Fork & Clone**
```bash
# Fork di GitHub, lalu clone fork-mu
git clone https://github.com/USERNAME/nawa-vault.git
cd nawa-vault

# Tambahkan remote upstream
git remote add upstream https://github.com/your-org/nawa-vault.git
```

**2. Buat Branch**
```bash
# Selalu buat branch dari main yang terbaru
git checkout main
git pull upstream main
git checkout -b feat/nama-fitur-kamu
```

**3. Kembangkan**

Lakukan perubahan, ikuti [standar kode](#-standar-kode) kami.

**4. Commit**
```bash
git add .
git commit -m "feat: tambah halaman laporan bulanan"
```

Ikuti [konvensi commit](#-standar-commit) kami.

**5. Push & Pull Request**
```bash
git push origin feat/nama-fitur-kamu
```

Kemudian buka Pull Request di GitHub. Isi template PR yang tersedia dengan lengkap.

---

## 📝 Standar Commit

Kami mengikuti **[Conventional Commits](https://www.conventionalcommits.org/)**.

### Format:
```
<type>(<scope>): <deskripsi singkat>

[body opsional]

[footer opsional]
```

### Tipe yang digunakan:

| Tipe | Digunakan untuk |
|------|-----------------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `docs` | Perubahan dokumentasi |
| `style` | Perubahan format/styling (tidak mengubah logika) |
| `refactor` | Refaktor kode (bukan fitur baru, bukan bug fix) |
| `perf` | Peningkatan performa |
| `test` | Menambah atau memperbaiki tes |
| `chore` | Perubahan build, dependency, config |
| `ci` | Perubahan CI/CD |

### Contoh commit yang baik:
```bash
feat(loans): tambah filter peminjaman berdasarkan tanggal
fix(auth): perbaiki redirect setelah login dengan callbackUrl
docs(readme): perbarui instruksi instalasi
refactor(sidebar): ekstrak navItems ke komponen terpisah
perf(assets): tambah indexing pada kolom asset_id
```

### Aturan tambahan:
- Gunakan **Bahasa Indonesia** untuk deskripsi (karena target pengguna lokal)
- Deskripsi dalam **huruf kecil**, tanpa titik di akhir
- Maksimal **72 karakter** untuk baris pertama
- Gunakan **body** untuk menjelaskan *mengapa*, bukan *apa*

---

## 🎨 Standar Kode

### TypeScript

```typescript
// ✅ Baik — gunakan tipe yang eksplisit
interface Asset {
  id: number;
  name: string;
  status: 'available' | 'borrowed' | 'maintenance';
}

// ❌ Hindari — jangan gunakan `any` kecuali terpaksa
function processData(data: any) { ... }

// ✅ Gunakan async/await, bukan .then()
const asset = await fetchAsset(id);

// ✅ Handle error dengan benar
try {
  const res = await fetch('/api/assets');
  if (!res.ok) throw new Error('Fetch failed');
} catch (error) {
  console.error('[fetchAsset]', error);
}
```

### React & Next.js

```tsx
// ✅ Gunakan "use client" hanya jika benar-benar perlu
// Komponen server (default) lebih diutamakan

// ✅ Pisahkan logika dari presentasi
// Gunakan custom hooks untuk logika kompleks

// ✅ Beri nama komponen yang deskriptif
export function AssetStatusBadge({ status }: { status: string }) { ... }
// ❌ Hindari nama generik
export function Badge({ status }: { status: string }) { ... }

// ✅ Gunakan Suspense untuk useSearchParams()
export default function Page() {
  return <Suspense><PageContent /></Suspense>;
}
```

### CSS & Styling

```tsx
// ✅ Gunakan cn() untuk kondisional className
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  isError && "error-class"
)} />

// ✅ Konsisten dengan design system yang ada
// Gunakan warna dari palet: violet-*, fuchsia-*, slate-*
// Hindari warna hardcoded (merah, biru mentah, dll)
```

### Struktur File

```
components/
├── shared/           # Komponen reusable (tidak spesifik ke halaman)
│   ├── Logo.tsx
│   └── ScannerView.tsx
└── layout/           # Komponen layout (Navbar, Sidebar)
    ├── Navbar.tsx
    └── Sidebar.tsx

app/
└── feature-name/
    ├── page.tsx      # Halaman utama
    ├── layout.tsx    # Layout spesifik (jika diperlukan)
    └── loading.tsx   # Loading state (jika diperlukan)
```

### Aturan Umum

- **Jangan** commit file `.env`, `.env.local`, atau file sensitif apapun
- **Jangan** commit file build (`.next/`, `node_modules/`)
- Semua **string UI** dalam Bahasa Indonesia
- Semua **komentar kode** boleh dalam Bahasa Indonesia atau Inggris
- Hapus **`console.log`** debug sebelum commit (kecuali `console.error` yang memang perlu)

---

## 👀 Review Pull Request

### Checklist sebelum membuat PR:

- [ ] Kode mengikuti standar yang ada di panduan ini
- [ ] Tidak ada `console.log` debugging yang tertinggal
- [ ] Tidak ada file yang tidak diperlukan ikut ter-commit
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Lint tidak ada error (`npm run lint`)
- [ ] Deskripsi PR menjelaskan *apa* yang berubah dan *mengapa*
- [ ] Screenshot/video dilampirkan untuk perubahan UI

### Apa yang kami cek saat review:

1. **Kebenaran** — apakah kode melakukan apa yang diklaim?
2. **Keamanan** — apakah ada potensi celah keamanan?
3. **Performa** — apakah ada query N+1, re-render berlebihan, dll?
4. **Konsistensi** — apakah mengikuti pola yang sudah ada?
5. **Maintainability** — apakah kode mudah dipahami dan diubah di masa depan?

### SLA Review:
- Pull Request akan di-review dalam **3 hari kerja**
- Jika tidak ada respons setelah 7 hari, mention maintainer di PR

---

## 🔧 Setup Lingkungan Pengembangan

Lihat [README.md](README.md#-memulai) untuk instruksi instalasi lengkap.

### Tools yang direkomendasikan:

**VS Code Extensions:**
- `bradlc.vscode-tailwindcss` — Tailwind CSS IntelliSense
- `dbaeumer.vscode-eslint` — ESLint
- `esbenp.prettier-vscode` — Prettier
- `ms-vscode.vscode-typescript-next` — TypeScript

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### Variabel Environment untuk Development:

```env
DATABASE_URL=postgresql://...     # Gunakan database development terpisah!
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-minimum-32-characters-long
```

> 💡 **Tips:** Buat database Neon terpisah untuk development agar tidak mengganggu data produksi.

---

## ❓ Butuh Bantuan?

- 💬 **Discord** — [discord.gg/nawavault](https://discord.gg/nawavault)
- 📧 **Email** — dev@nawavault.id
- 💡 **GitHub Discussions** — untuk pertanyaan umum dan ide

---

<div align="center">

Terima kasih sudah berkontribusi untuk membuat pendidikan Indonesia lebih baik! 💜

</div>
