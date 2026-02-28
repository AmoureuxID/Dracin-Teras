# Panduan Environment Variables - Teras Dracin

## 🎯 Tujuan

File ini menjelaskan cara menggunakan environment variables untuk mengganti API keys dengan mudah tanpa perlu mengedit kode.

## 📝 Langkah-langkah Setup

### 1. Copy File Template

Sudah ada file `.env.example` sebagai template. Anda tinggal copy menjadi `.env`:

```bash
cp .env.example .env
```

Atau bisa juga manual copy-paste isi file `.env.example` ke file baru bernama `.env`.

### 2. Edit File .env

Buka file `.env` dengan text editor favorit Anda dan edit nilai-nilai berikut:

```env
# Base API URL untuk Drama, Anime, dan Komik
VITE_API_BASE_URL=https://api.terasdracin.my.id

# Alternative MovieBox Base URL (jika berbeda dari API_BASE_URL)
VITE_MOVIEBOX_BASE_URL=https://api.terasdracin.my.id

# Anime API (Samehadaku)
VITE_ANIME_API_URL=https://api.terasdracin.my.id/anime/samehadaku

# Comic API (Bacakomik)
VITE_COMIC_API_URL=https://api.terasdracin.my.id/comic
```

### 3. Ganti dengan API Keys Teman

Jika Anda mau pakai API keys dari akun teman, tinggal ganti nilai di atas dengan URL yang diberikan teman Anda:

```env
# Contoh menggunakan API dari teman
VITE_API_BASE_URL=https://api-teman.domain.com
VITE_ANIME_API_URL=https://api-teman.domain.com/anime/samehadaku
VITE_COMIC_API_URL=https://api-teman.domain.com/comic
```

### 4. Restart Development Server

Setelah mengedit file `.env`, restart development server agar perubahan diterapkan:

```bash
# Stop server dengan Ctrl+C, lalu jalankan lagi
pnpm dev
```

## 🔒 Keamanan

### ⚠️ PENTING!

1. **JANGAN PERNAH** commit file `.env` ke Git/GitHub
2. File `.env` sudah otomatis diabaikan oleh Git (ada di `.gitignore`)
3. File `.env.example` boleh di-commit karena hanya berisi template tanpa API keys asli

### Kenapa Harus Pakai .env?

- ✅ API keys tidak terlihat di kode
- ✅ Mudah ganti API keys tanpa edit kode
- ✅ Setiap developer bisa pakai API keys sendiri
- ✅ Lebih aman karena tidak ter-commit ke repository

## 📋 Daftar Environment Variables

| Variable | Untuk Apa | Wajib? |
|----------|-----------|--------|
| `VITE_API_BASE_URL` | API Drama, MovieBox, dan endpoint utama | Ya |
| `VITE_MOVIEBOX_BASE_URL` | Khusus MovieBox API (jika beda) | Tidak (fallback ke API_BASE_URL) |
| `VITE_ANIME_API_URL` | API Anime dari Samehadaku | Ya |
| `VITE_COMIC_API_URL` | API Komik dari Bacakomik | Ya |
| `VITE_API_KEY` | API Key (jika diperlukan di masa depan) | Tidak |
| `VITE_API_SECRET` | API Secret (jika diperlukan di masa depan) | Tidak |

## 🔧 Troubleshooting

### Problem: Environment variables tidak terbaca

**Solusi:**
1. Pastikan nama file adalah `.env` (bukan `env.txt` atau lainnya)
2. Pastikan semua variable diawali dengan `VITE_`
3. Restart development server setelah edit `.env`
4. Pastikan tidak ada spasi sebelum/sesudah tanda `=`

### Problem: Masih pakai URL lama setelah edit .env

**Solusi:**
1. Pastikan sudah restart development server
2. Clear browser cache (Ctrl+Shift+R atau Cmd+Shift+R)
3. Cek apakah ada typo di nama variable

### Problem: File .env tidak ada

**Solusi:**
1. Copy dari `.env.example`: `cp .env.example .env`
2. Atau buat manual file baru bernama `.env` di root folder project

## 💡 Tips

1. **Backup API Keys**: Simpan API keys di tempat aman (password manager, notes pribadi)
2. **Testing**: Gunakan API keys development untuk testing, production untuk live
3. **Team Work**: Setiap developer bisa pakai API keys sendiri tanpa konflik
4. **Update**: Jika ada environment variable baru, update juga `.env.example`

## 📖 Contoh Penggunaan

### Skenario 1: Development Lokal
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ANIME_API_URL=http://localhost:3000/anime/samehadaku
VITE_COMIC_API_URL=http://localhost:3000/comic
```

### Skenario 2: Production dengan API Teman
```env
VITE_API_BASE_URL=https://api-teman-production.com
VITE_ANIME_API_URL=https://api-teman-production.com/anime/samehadaku
VITE_COMIC_API_URL=https://api-teman-production.com/comic
```

### Skenario 3: Staging/Testing
```env
VITE_API_BASE_URL=https://staging.terasdracin.my.id
VITE_ANIME_API_URL=https://staging.terasdracin.my.id/anime/samehadaku
VITE_COMIC_API_URL=https://staging.terasdracin.my.id/comic
```

## 🎓 Untuk Developer

Jika Anda ingin menambahkan environment variable baru:

1. **Tambahkan di `/src/app/utils/env.ts`:**
```typescript
export const NEW_API_URL = import.meta.env.VITE_NEW_API_URL || 'default-value';
```

2. **Tambahkan di `/src/vite-env.d.ts`:**
```typescript
interface ImportMetaEnv {
  // ... existing variables
  readonly VITE_NEW_API_URL: string
}
```

3. **Update `.env` dan `.env.example`:**
```env
VITE_NEW_API_URL=https://api.example.com
```

4. **Update dokumentasi ini dan README.md**

## ❓ Pertanyaan?

Jika ada pertanyaan tentang environment variables:
1. Baca dokumentasi ini dulu
2. Cek file `/src/imports/terasdracin-api-docs.md`
3. Tanya ke tim developer

---

**Terakhir diupdate**: February 2026  
**Versi**: 1.0.0
