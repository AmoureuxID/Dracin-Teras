/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_MOVIEBOX_BASE_URL?: string
  readonly VITE_ANIME_API_URL?: string
  readonly VITE_COMIC_API_URL?: string
  readonly VITE_API_KEY?: string
  readonly VITE_API_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
