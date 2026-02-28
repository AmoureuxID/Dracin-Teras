# Laporan Cek API Anime (Untuk AI)

Dokumen ini merangkum API anime yang dicek, serta bentuk data yang dihasilkan dari response.

## Ringkasan

- Waktu generate: `2026-02-28T12:54:04.388Z`
- Base API: `https://api.terasdracin.my.id/anime/samehadaku`
- Total API dicek: `5`
- Berhasil: `5`
- Gagal: `0`
- File output mentah: `anime-api-check-result.json`

## API Yang Dicek

1. `GET https://api.terasdracin.my.id/anime/samehadaku/ongoing?page=1`
2. `GET https://api.terasdracin.my.id/anime/samehadaku/completed?page=1`
3. `GET https://api.terasdracin.my.id/anime/samehadaku/schedule`
4. `GET https://api.terasdracin.my.id/anime/samehadaku/genres`
5. `GET https://api.terasdracin.my.id/anime/samehadaku/list`

## API Yang Dihasilkan (Hasil Response)

### 1) Ongoing Anime

- Endpoint: `/ongoing?page=1`
- Status: `200 OK`
- Key utama: `data.animeList`
- Jumlah item contoh saat dicek: `30`

### 2) Completed Anime

- Endpoint: `/completed?page=1`
- Status: `200 OK`
- Key utama: `data.animeList`
- Jumlah item contoh saat dicek: `30`

### 3) Jadwal Rilis

- Endpoint: `/schedule`
- Status: `200 OK`
- Key utama: `data.days`
- Jumlah hari saat dicek: `7`

### 4) Genre Anime

- Endpoint: `/genres`
- Status: `200 OK`
- Key utama: `data.genreList`
- Jumlah genre saat dicek: `20`

### 5) Anime List

- Endpoint: `/list`
- Status: `200 OK`
- Key utama: `data.list`
- Jumlah grup/list saat dicek: `25`

## Pola Struktur Response

Semua endpoint yang dicek memiliki pola top-level mirip:

```json
{
  "status": true,
  "creator": "...",
  "message": "...",
  "data": {"...": "..."},
  "pagination": {...}
}
```

Catatan: isi `data` berbeda per endpoint (misalnya `animeList`, `days`, `genreList`, `list`).

## Cara Menjalankan Ulang Cek

```bash
node scripts/check-anime-apis.mjs
```

Atau tentukan nama output sendiri:

```bash
node scripts/check-anime-apis.mjs hasil-cek-anime.json
```
