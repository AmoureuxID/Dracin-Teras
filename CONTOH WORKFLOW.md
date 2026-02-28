# WORKFLOW: Home → Pilih Video → Ambil Link Video

Dokumen ini menjelaskan alur lengkap dari beranda sampai video bisa diputar/diambil link‑nya untuk semua platform: drama, komik, anime, dan MovieBox. Formatnya disusun agar mudah dijelaskan ke AI saat implementasi di web lain.

## Ringkasan Umum (Semua Platform)

1) **Home** menampilkan daftar konten dari API internal `/api/*` (atau upstream langsung untuk anime/komik).
2) **Klik kartu** menuju halaman detail (`/detail/...` atau `/film/[subjectId]`).
3) **Detail** mengambil data lengkap (metadata + daftar episode).
4) **Watch/Player** mengambil URL video dari endpoint khusus, lalu memutar dengan `<video>`/HLS/iframe.
5) Jika URL video memerlukan referer/CORS, gunakan **proxy** `/api/proxy/video`.

Catatan penting:
- Banyak endpoint internal mengembalikan data terenkripsi (`encryptedResponse`). Client memakai `fetchJson` untuk dekripsi otomatis.
- Untuk video yang bertoken/cepat kadaluarsa (mis. FlickReels), **jangan cache** dan refetch saat error.

## DramaBox (Drama)

**Home → Detail → Watch**
1) Home: mengambil list lewat `/api/dramabox/vip`, `/api/dramabox/foryou`, `/api/dramabox/latest`, `/api/dramabox/trending` (React Query).
2) Detail: `/detail/dramabox/[bookId]` → `useDramaDetail(bookId)` → `/api/dramabox/detail/{bookId}`.
3) Watch: `/watch/dramabox/[bookId]?ep=0..n` → `useEpisodes(bookId)` → `/api/dramabox/allepisode/{bookId}`.
4) URL video diambil dari `episode.cdnList -> default cdn -> videoPathList -> videoPath` berdasarkan quality.
5) Diputar dengan `<video src={videoPath}>` langsung (MP4 URL).

**Inti implementasi**
- Detail: ambil bookId dari kartu di home.
- Watch: ambil episode list, pilih quality, pakai `videoPath`.

## ReelShort (Drama)

**Home → Detail → Watch**
1) Home: `/api/reelshort/homepage`.
2) Detail: `/detail/reelshort/[bookId]` → `/api/reelshort/detail?bookId=...`.
3) Watch: `/watch/reelshort/[bookId]?ep=1..n` → `/api/reelshort/watch?bookId=...&episodeNumber=...`.
4) Response episode berisi `videoList` (HLS). Pilih kualitas (default H264).
5) Pemutar memakai HLS.js untuk `.m3u8` atau native HLS bila didukung.

**Inti implementasi**
- Ambil `videoList[].url`, pilih H264 untuk kompatibilitas.
- Gunakan HLS.js jika URL `.m3u8`.

## NetShort (Drama)

**Home → Detail → Watch**
1) Home: `/api/netshort/foryou?page=1` atau `/api/netshort/theaters`.
2) Detail: `/detail/netshort/[shortPlayId]` → `/api/netshort/detail?shortPlayId=...` (mengembalikan semua episode).
3) Watch: `/watch/netshort/[shortPlayId]?ep=1..n` → pakai episode dari detail.
4) Video URL ada di `episode.videoUrl` (HLS/MP4).
5) Pemutar memakai HLS.js jika `.m3u8`, fallback native `<video>`.
6) Subtitle: jika ada, diproxy lewat `/api/proxy/video?url=...` lalu disisipkan sebagai track.

**Inti implementasi**
- Detail sudah berisi episode list lengkap.
- Pilih episode, pakai `videoUrl`, gunakan HLS.js bila perlu.

## Melolo (Drama)

**Home → Detail → Watch**
1) Home: `/api/melolo/latest` dan `/api/melolo/trending`.
2) Detail: `/detail/melolo/[bookId]` → `/api/melolo/detail?bookId=...` → `video_data` berisi `video_list` (episode).
3) Watch: `/watch/melolo/[bookId]/[videoId]`.
4) Streaming URL diambil lewat `/api/melolo/stream?videoId=...`.
5) Response `video_model` adalah JSON string berisi `video_list` dengan `main_url` (kadang base64).
6) Decode `main_url`, pilih kualitas (mis. 720p), lalu `<video src={url}>`.

**Inti implementasi**
- Ambil `vid` dari `video_list` untuk pindah episode.
- Decode `main_url` jika base64.

## FlickReels (Drama)

**Home → Detail → Watch**
1) Home: `/api/flickreels/foryou`, `/api/flickreels/latest`, `/api/flickreels/hotrank`.
2) Detail: `/detail/flickreels/[bookId]` → `/api/flickreels/detail?id=...` (no‑store karena URL video bertoken).
3) Watch: `/watch/flickreels/[bookId]/[videoId]`.
4) Episode berisi `raw.videoUrl`. URL ini perlu referer.
5) Gunakan proxy:
   - Warmup: `/api/proxy/warmup?url={videoUrl}`
   - Stream: `/api/proxy/video?url={videoUrl}&referer=https://www.flickreels.com/`
6) Jika video gagal, refetch detail untuk mendapat URL baru.

**Inti implementasi**
- Jangan cache detail (token cepat kadaluarsa).
- Selalu gunakan proxy + referer.

## FreeReels (Drama)

**Home → Detail → Watch**
1) Home: `/api/freereels/home`, `/api/freereels/anime`, `/api/freereels/foryou`.
2) Detail: `/detail/freereels/[bookId]` → `/api/freereels/detail?id=...` (disaring di `useFreeReelsDetail`).
3) Watch: `/watch/freereels/[bookId]?ep=1..n`.
4) Episode memiliki `external_audio_h264_m3u8` dan `external_audio_h265_m3u8`, serta `subtitleUrl`.
5) Pemutar memakai HLS.js (m3u8). Untuk CORS, gunakan proxy:
   - `/api/proxy/video?url={m3u8}`
6) Subtitle Indonesia juga diproxy lalu disisipkan sebagai track.

**Inti implementasi**
- Default gunakan proxy untuk menghindari CORS.
- Pilih H264 untuk kompatibilitas, H265 opsional.

## Anime (Samehadaku)

**Home → Detail → Play**
1) Home: data anime diambil dari upstream Samehadaku (berbeda halaman: ongoing, complete, dll).
2) Detail: `/detail/anime/[id]` → `${API_BASE}/anime/{slug}`.
3) Saat pilih episode:
   - Ambil server list: `${API_BASE}/episode/{episodeId}` → `server.qualities`.
   - Pilih server: `${API_BASE}/server/{serverId}` → `url`.
4) Video diputar lewat `<iframe src={url}>`.

**Inti implementasi**
- Episode tidak langsung berisi URL; harus ambil server list lalu server URL.

## Komik (BacaKomik)

**Home → Detail → Chapter**
1) Home: list komik dari `${BACA_BASE}/latest/{page}`, `${BACA_BASE}/populer/{page}`, `${BACA_BASE}/top`, dll.
2) Detail: `/komik/detail/[slug]` → `${BACA_BASE}/detail/{slug}`.
3) Chapter: `/komik/chapter/[slug]` → `${BACA_BASE}/chapter/{slug}`.
4) Hasil chapter berisi array `images` → tampilkan `<img>` per halaman.

**Inti implementasi**
- Tidak ada video, hanya daftar gambar per chapter.

## MovieBox (Film/Series)

**Home → Detail → Ambil Link**
1) Home: `/api/moviebox/homepage` dan `/api/moviebox/trending?page=0`.
2) Detail: `/film/[subjectId]` → `/api/moviebox/detail?subjectId=...`.
3) Ambil link streaming:
   - `/api/moviebox/sources?subjectId=...&season=...&episode=...`
   - Ambil `sourceUrl`
   - `/api/moviebox/generate-link-stream-video?url={sourceUrl}`
   - Ambil `finalUrl` dari response
4) UI di proyek ini menampilkan tombol **Ambil Link Download**, bukan player langsung.

**Jika ingin diputar**
- Gunakan `<video src={finalUrl}>` atau HLS.js jika `.m3u8`.
- Bila CORS bermasalah, lewatkan ke proxy: `/api/proxy/video?url={finalUrl}`.

## Endpoint Proxy (Penting untuk Video)

- `/api/proxy/video?url={url}&referer={referer}`  
  Proxy streaming video/HLS/subtitle, mendukung Range dan rewrite M3U8.
- `/api/proxy/warmup?url={url}`  
  Warm-up token agar tidak gagal pada request pertama.

## Ringkas untuk Dijelaskan ke AI

1) Home pakai API list → tampilkan kartu.
2) Klik kartu → halaman detail ambil detail + episode.
3) Klik episode → ambil URL video (kadang perlu server step).
4) Jika URL HLS (`.m3u8`), pakai HLS.js.
5) Jika CORS/hotlink, pakai `/api/proxy/video` + referer.
6) Untuk FlickReels/FreeReels, URL bertoken → refetch saat error.
