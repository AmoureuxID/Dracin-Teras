# Teras Dracin - Website Streaming

Website streaming untuk drama China, anime, komik, dan film yang mengintegrasikan berbagai sumber konten dari API terasdracin.my.id.

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Kemudian edit file `.env` dan ganti dengan API keys Anda:

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

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm dev
```

## 🔑 Environment Variables

Semua konfigurasi API disimpan di file `.env`. Berikut adalah environment variables yang tersedia:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL public tunggal API | `https://api.terasdracin.my.id` |
| `VITE_MOVIEBOX_BASE_URL` | Base URL untuk MovieBox API | sama dengan `VITE_API_BASE_URL` |
| `VITE_ANIME_API_URL` | Base URL untuk Anime API (Samehadaku) | `https://api.terasdracin.my.id/anime/samehadaku` |
| `VITE_COMIC_API_URL` | Base URL untuk Comic API (Bacakomik) | `https://api.terasdracin.my.id/comic` |

### ⚠️ Catatan Penting

- **JANGAN** commit file `.env` ke repository (sudah ada di `.gitignore`)
- Gunakan file `.env.example` sebagai template
- Semua environment variables harus diawali dengan `VITE_` untuk bisa diakses di client-side (Vite requirement)

## 📦 API Sources

Website ini mengintegrasikan konten dari:

### Drama China
- **DramaBox** - Drama series dengan dubbing Indonesia
- **ReelShort** - Short drama series
- **NetShort** - Theater dan drama series
- **Melolo** - Drama series terbaru
- **FlickReels** - Drama reels dan hot rank
- **FreeReels** - Free drama content

### Movie
- **MovieBox** - Film dan serial dengan berbagai genre

### Anime
- **Samehadaku API** - Anime ongoing, completed, dan schedule

### Komik
- **Bacakomik API** - Manga, Manhwa, dan Manhua

## 🛠️ Tech Stack

- **React** - UI Framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **TypeScript** - Type safety

## 📝 File Structure

```
/
├── .env                    # Environment variables (JANGAN di-commit)
├── .env.example           # Template untuk environment variables
├── .gitignore            # Git ignore rules
├── src/
│   ├── app/
│   │   ├── utils/
│   │   │   ├── env.ts    # Environment configuration
│   │   │   └── api.ts    # API functions
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   └── routes.ts     # Route configuration
│   └── imports/          # API documentation
└── package.json
```

## 🔄 Cara Ganti API Keys

Jika Anda ingin menggunakan API keys dari akun teman:

1. Minta API URL dari teman Anda
2. Edit file `.env`
3. Ganti nilai `VITE_API_BASE_URL` dengan URL yang diberikan
4. Restart development server

```env
# Contoh menggunakan API keys teman
VITE_API_BASE_URL=https://api-teman.domain.com
VITE_ANIME_API_URL=https://api-teman.domain.com/anime/samehadaku
VITE_COMIC_API_URL=https://api-teman.domain.com/comic
```

## 📚 Documentation

Dokumentasi lengkap API tersedia di:
- `/src/imports/terasdracin-api-docs.md` - Dokumentasi API endpoints
- `/src/imports/AI_API_ANIME_FIX_SUMMARY.md` - Dokumentasi perbaikan Anime API

## 🤝 Contributing

Jika ingin berkontribusi:
1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## ⚖️ License

This project is private and proprietary.

## 📧 Contact

Untuk pertanyaan atau dukungan, silakan hubungi tim developer.
