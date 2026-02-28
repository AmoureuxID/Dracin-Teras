# Dokumentasi API Bacakomik

**Base URL:** `https://api.terasdracin.my.id`

## 📰 Komik Terbaru
Mendapatkan daftar komik terbaru.

**Endpoint:** `GET /comic/bacakomik/latest`

**Response:**
```json
{
  "creator": "Sanka Vollerei",
  "success": true,
  "komikList": [
    {
      "title": "Absolute Domination at Level 0 with My Analysis Skill",
      "slug": "absolute-domination-at-level-0-with-my-analysis-skill",
      "cover": "https://i2.wp.com/bacakomik.my/wp-content/...jpg",
      "chapter": "Ch.6",
      "date": "4 menit lalu",
      "type": "manga"
    }
  ]
}
```

---

## 🌟 Komik Populer
Mendapatkan daftar komik populer.

**Endpoint:** `GET /comic/bacakomik/populer`

**Response:** Same format as `/latest`

---

## 🏆 Top Komik
Mendapatkan daftar komik ranking teratas.

**Endpoint:** `GET /comic/bacakomik/top`

**Response:** Same format as `/latest`

---

## 📚 Daftar Semua Komik
Mendapatkan daftar semua komik dengan filter status.

**Endpoint:** `GET /comic/bacakomik/list`

**Response:**
```json
{
  "status": [
    { "title": "All", "value": "" },
    { "title": "Ongoing", "value": "Ongoing" },
    { "title": "Completed", "value": "Completed" },
    { "title": "Hiatus", "value": "Hiatus" }
  ],
  "creator": "Sanka Vollerei",
  "success": true,
  "komikList": [
    {
      "title": "...",
      "slug": "...",
      "cover": "...",
      "rating": "8.6",
      "type": "manhwa",
      "status": "Ongoing"
    }
  ]
}
```

---

## 🔎 Cari Komik
Mencari komik berdasarkan judul.

**Endpoint:** `GET /comic/bacakomik/search/:query`

**Contoh:** `/comic/bacakomik/search/solo`

**Response:** Same format as `/latest`

---

## 🏷️ Daftar Genre
Melihat semua genre yang tersedia.

**Endpoint:** `GET /comic/bacakomik/genres`

**Response:**
```json
{
  "creator": "Sanka Vollerei",
  "success": true,
  "genres": [
    { "title": "Action", "slug": "action" },
    { "title": "Adventure", "slug": "adventure" },
    { "title": "Fantasy", "slug": "fantasy" }
  ]
}
```

---

## 🎭 Filter by Genre
Mencari komik berdasarkan genre spesifik.

**Endpoint:** `GET /comic/bacakomik/genre/:genre`

**Contoh:** `/comic/bacakomik/genre/action`

**Response:** Same format as `/latest`

---

## 🧩 Filter by Type
Filter komik berdasarkan tipenya.

**Endpoint:** `GET /comic/bacakkomik/only/:type`

**Contoh:** 
- `/comic/bacakomik/only/manga`
- `/comic/bacakomik/only/manhwa`
- `/comic/bacakomik/only/manhua`

**Response:** Same format as `/latest`

---

## ℹ️ Detail Komik
Mendapatkan info detail, sinopsis, dan daftar chapter.

**Endpoint:** `GET /comic/bacakomik/detail/:slug`

**Contoh:** `/comic/bacakomik/detail/nano-machine`

**Response:**
```json
{
  "creator": "Sanka Vollerei",
  "success": true,
  "detail": {
    "title": "Nano Machine",
    "cover": "https://i2.wp.com/bacakomik.my/...jpg",
    "rating": "8.1",
    "otherTitle": "Nano Mashin, Ngã lão ma thần",
    "status": "Berjalan",
    "type": "Manhwa",
    "author": "Great H, HANJUNG WOLYA",
    "artist": "GGBG",
    "release": "2020",
    "series": "Naver Series (Naver), Naver Webtoon (Naver)",
    "reader": "2 jt orang",
    "synopsis": "Manhwa Nano Machine yang dibuat...",
    "genres": [
      { "title": "Action", "slug": "action" },
      { "title": "Adventure", "slug": "adventure" },
      { "title": "Fantasy", "slug": "fantasy" }
    ],
    "chapters": [
      {
        "title": "",
        "slug": "nano-machine-chapter-301",
        "date": "1 hari yang lalu"
      },
      {
        "title": "",
        "slug": "nano-machine-chapter-300",
        "date": "1 minggu yang lalu"
      }
    ]
  }
}
```

---

## 📖 Baca Chapter
Membaca chapter komik berdasarkan slug chapter.

**Endpoint:** `GET /comic/bacakomik/chapter/:slug`

**Contoh:** `/comic/bacakomik/chapter/nano-machine-chapter-301`

**Response:**
```json
{
  "creator": "Sanka Vollerei",
  "success": true,
  "title": "Nano Machine Chapter 301",
  "images": [
    "https://imageainewgeneration.lol/data/588266/1/.../1.jpg",
    "https://himmga.lat/data/588266/1/.../2.jpg",
    "https://gaimgame.pics/data/588266/1/.../3.jpg"
  ],
  "navigation": {
    "next": "nano-machine-chapter-302",
    "prev": "nano-machine-chapter-300"
  }
}
```

---

## 💡 Rekomendasi
Mendapatkan rekomendasi komik.

**Endpoint:** `GET /comic/bacakomik/recomen`

**Response:** Same format as `/latest`

---

## 📢 Komik Berwarna
Mendapatkan daftar komik berwarna.

**Endpoint:** `GET /comic/bacakomik/komikberwarna`

**Response:** Same format as `/latest`

---

# 🔄 Workflow Lengkap

## 1. Tampilkan Daftar Komik (Home)
Gunakan endpoint dari list ini:
- `/comic/bacakomik/latest` - Komik terbaru
- `/comic/bacakomik/populer` - Komik populer
- `/comic/bacakomik/top` - Ranking teratas
- `/comic/bacakomik/recomen` - Rekomendasi
- `/comic/bacakomik/komikberwarna` - Komik berwarna
- `/comic/bacakomik/only/manga` - Filter Manga
- `/comic/bacakomik/only/manhwa` - Filter Manhwa
- `/comic/bacakkomik/only/manhua` - Filter Manhua

**Response field yang dipakai:**
```javascript
{
  komikList: [
    {
      title: "Judul Komik",
      slug: "slug-komik",           // ← Dipakai untuk detail
      cover: "url-gambar",
      chapter: "Ch.6",
      date: "4 menit lalu",
      type: "manga"                // manga/manhwa/manhua
    }
  ]
}
```

---

## 2. Klik Komik → Halaman Detail
Gunakan slug dari home untuk mendapatkan detail.

**Endpoint:** `/comic/bacakomik/detail/:slug`

**Contoh:** `/comic/bacakomik/detail/nano-machine`

**Response field yang dipakai:**
```javascript
{
  detail: {
    title: "Nano Machine",
    cover: "url-gambar",
    rating: "8.1",
    status: "Berjalan",            // Ongoing/Completed/Hiatus
    type: "Manhwa",
    author: "Great H",
    synopsis: "Sinopsis...",
    genres: [
      { title: "Action", slug: "action" }
    ],
    chapters: [                    // ← Daftar chapter
      { slug: "nano-machine-chapter-301", date: "1 hari lalu" },
      { slug: "nano-machine-chapter-300", date: "1 minggu lalu" }
    ]
  }
}
```

---

## 3. Klik Chapter → Baca Komik
Gunakan slug chapter dari detail untuk mendapatkan gambar.

**Endpoint:** `/comic/bacakomik/chapter/:slug`

**Contoh:** `/comic/bacakomik/chapter/nano-machine-chapter-301`

**Response field yang dipakai:**
```javascript
{
  title: "Nano Machine Chapter 301",
  images: [                        // ← Array URL gambar
    "https://.../1.jpg",
    "https://.../2.jpg",
    "https://.../3.jpg"
  ],
  navigation: {
    next: "nano-machine-chapter-302",   // ← Chapter selanjutnya
    prev: "nano-machine-chapter-300"    // ← Chapter sebelumnya
  }
}
```

---

## 📌 Ringkasan

| Halaman | Endpoint | Field Penting |
|---------|----------|--------------|
| Home/List | `/latest`, `/populer`, dll | `komikList[].slug` |
| Detail | `/detail/:slug` | `detail.chapters[].slug` |
| Baca | `/chapter/:slug` | `images[]` |

---

## ⚠️ Catatan Penting

1. **Chapter slug**: Formatnya `{slug-komik}-chapter-{nomor}`, contoh: `nano-machine-chapter-301`
2. **Images array**: Semua URL dalam array `images` adalah halaman komik, tampilkan berurutan
3. **Navigation**: Gunakan `navigation.next` dan `navigation.prev` untuk tombol prev/next chapter
4. **Pagination**: Beberapa endpoint support pagination dengan parameter `?page={nomor}`
