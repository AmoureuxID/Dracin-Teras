# Terasdracin API Docs (Mode Matrix)

Dokumen ini mengikuti playbook resmi dan dipakai sebagai acuan implementasi frontend saat ini.

## Base URL Tunggal

- Public base URL: `https://api.terasdracin.my.id`
- Internal backend base URL: `https://api.terasdracin.my.id/api`

Di kode:

- `API_BASE_URL` = public base URL (DIRECT/HYBRID)
- `BACKEND_API_BASE_URL` = `${API_BASE_URL}/api` (BACKEND)

## Mode Endpoint

- `DIRECT`: client langsung ke public endpoint
- `BACKEND`: client lewat `/api/*` untuk validasi/proxy/endpoint sensitif
- `HYBRID`: default direct, bisa dipindah ke backend saat scale/abuse

## Endpoint Yang Dipakai Frontend

### Anime (DIRECT)

- `GET /anime/samehadaku/ongoing?page={page}`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeOngoing`
  - Parse utama: `data.animeList`
- `GET /anime/samehadaku/completed?page={page}`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeCompleted`
  - Parse utama: `data.animeList`
- `GET /anime/samehadaku/anime/{slug}`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeDetail`
- `GET /anime/samehadaku/search?q={query}&page={page}`
  - Mode: DIRECT
  - Dipakai di: `searchAnime`
- `GET /anime/samehadaku/schedule`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeSchedule`
  - Parse utama: `data.days`
- `GET /anime/samehadaku/genres`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeGenres`
  - Parse utama: `data.genreList`
- `GET /anime/samehadaku/genres/{slug}?page={page}`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeByGenre`
- `GET /anime/samehadaku/list`
  - Mode: DIRECT
  - Dipakai di: `fetchAnimeList`
  - Parse utama: `data.list`

### Komik (HYBRID, currently DIRECT)

#### Bacakomik
- `GET /comic/bacakomik/top`
- `GET /comic/bacakomik/latest/{page}`
- `GET /comic/bacakomik/populer/{page}`
- `GET /comic/bacakomik/detail/{slug}`
- `GET /comic/bacakomik/search/{query}?q={query}&page={page}`
- `GET /comic/bacakomik/genres`
- `GET /comic/bacakomik/genre/{genre}/{page}`
- `GET /comic/bacakomik/only/manga/{page}`
- `GET /comic/bacakomik/only/manhwa/{page}`
- `GET /comic/bacakomik/only/manhua/{page}`
- `GET /comic/bacakomik/komikberwarna/{page}`
- `GET /comic/bacakomik/chapter/{slug}`

#### Pustaka (Komiku) - Terpisah dari Bacakomik
- `GET /comic/pustaka/{page}`
- `GET /comic/comic/{slug}`
- `GET /comic/chapter/{slug}`
- `GET /comic/chapter/{slug}/navigation`
- `GET /comic/genre/{genre}`
- `GET /comic/type/{type}`

Semua dipanggil direct dari `API_BASE_URL` melalui helper di `src/app/utils/api.ts`.

### Drama + Provider Lain (HYBRID, currently DIRECT)

- DramaBox:
  - `GET /dramabox/vip`
  - `GET /dramabox/trending`
  - `GET /dramabox/latest`
  - `GET /dramabox/randomdrama`
  - `GET /dramabox/foryou`
  - `GET /dramabox/dubindo?classify={classify}&page={page}`
  - `GET /dramabox/search?query={query}`
  - `GET /dramabox/detail/{bookId}`
  - `GET /dramabox/allepisode/{bookId}`
- ReelShort:
  - `GET /reelshort/homepage`
  - `GET /reelshort/search?query={query}&page={page}`
  - `GET /reelshort/detail?bookId={bookId}`
  - `GET /reelshort/watch?bookId={bookId}&episodeNumber={episodeNumber}`
- Melolo:
  - `GET /melolo/latest`
  - `GET /melolo/trending`
  - `GET /melolo/search?query={query}`
  - `GET /melolo/detail?bookId={bookId}`
  - `GET /melolo/stream?videoId={videoId}`
- FlickReels:
  - `GET /flickreels/foryou`
  - `GET /flickreels/latest`
  - `GET /flickreels/hotrank`
  - `GET /flickreels/search?query={query}`
  - `GET /flickreels/detailAndAllEpisode?id={id}`
- FreeReels:
  - `GET /freereels/foryou`
  - `GET /freereels/homepage`
  - `GET /freereels/animepage`
  - `GET /freereels/search?query={query}`
  - `GET /freereels/detailAndAllEpisode?key={key}`
- NetShort:
  - `GET /netshort/theaters`

### MovieBox (HYBRID, currently DIRECT)

- `GET /moviebox/homepage`
- `GET /moviebox/trending?page={page}`
- `GET /moviebox/search?query={query}&page={page}`
- `GET /moviebox/detail?subjectId={subjectId}`
- `GET /moviebox/sources?subjectId={subjectId}&season={season}&episode={episode}`
- `GET /moviebox/generate-link-stream-video?url={url}`

### Endpoint Sensitif (BACKEND)

- `GET /api/proxy/video?url={url}[&referer={referer}]`
  - Mode: BACKEND
  - Dipakai di: `WatchPage`
  - Alasan: menerima URL mentah, butuh kontrol keamanan

Endpoint BACKEND lain yang diwajibkan playbook (meski belum dipakai langsung di UI saat ini):

- `GET /api/proxy/warmup?url={url}`
- `GET /api/download?url={url}`
- `GET /api/moviebox/generate-link-stream-video?url={url}`

## Kebijakan Cache (Rekomendasi Awal)

- Search endpoint: `no-store`
- Home/Trending/ForYou: `revalidate 300-3600`
- Detail: `revalidate 300-1800`
- Streaming/proxy endpoint: `no-store`

## Kontrak Error Minimum

Untuk endpoint BACKEND, gunakan shape konsisten:

```json
{
  "success": false,
  "message": "...",
  "requestId": "..."
}
```

## Catatan Implementasi Frontend Saat Ini

- Parser response di `src/app/utils/api.ts` sudah dinormalisasi untuk beberapa shape (`array`, `data`, `data.<listKey>`, `komikList`, `subjectList`, dll).
- Anime diset sebagai DIRECT sesuai playbook.
- Proxy video sudah pakai BACKEND (`/api/proxy/video`).
