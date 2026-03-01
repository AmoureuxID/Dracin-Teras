import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, Maximize, Play, Pause } from 'lucide-react';
import { API_BASE_URL, ANIME_API_URL } from '../utils/env';

export function WatchPage() {
  const { id, slug, episode } = useParams<{ id?: string; slug?: string; episode?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isAnimeRoute = location.pathname.startsWith('/watch/anime/');
  const contentId = slug || id || '';
  const source = searchParams.get('source') || (isAnimeRoute ? 'anime' : 'dramabox');
  const episodeParam = searchParams.get('episode') || episode || '';
  const parsedEpisode = Number.parseInt(episodeParam || '1');
  const currentEpisode = Number.isFinite(parsedEpisode) ? parsedEpisode : 1;
  const seasonParam = searchParams.get('season') || '';
  const parsedSeason = Number.parseInt(seasonParam || '0');
  const currentSeason = Number.isFinite(parsedSeason) ? parsedSeason : 0;
  
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isIframe, setIsIframe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const extractEpisodes = (payload: any): any[] => {
    const fromData = payload?.data;
    return (
      payload?.allEpisodes ||
      payload?.episodes ||
      payload?.episodeList ||
      fromData?.allEpisodes ||
      fromData?.episodes ||
      fromData?.episodeList ||
      (Array.isArray(fromData) ? fromData : null) ||
      (Array.isArray(payload) ? payload : [])
    );
  };

  const normalizeDramaBoxEpisodes = (episodes: any[]): any[] => {
    return episodes.map((ep: any, index: number) => ({
      ...ep,
      episodeNumber: ep.chapterIndex + 1,
      number: ep.chapterIndex + 1,
      id: ep.chapterId,
      title: ep.chapterName,
    }));
  };

  const extractWatchUrl = (payload: any): string | undefined => {
    const fromData = payload?.data;
    return payload?.videoUrl || payload?.url || fromData?.videoUrl || fromData?.url;
  };

  const decodeBase64 = (value: string) => {
    try {
      return atob(value);
    } catch {
      return value;
    }
  };

  const getDirectUrl = (url: string) => url;

  const pickDramaBoxUrl = (episodeData: any) => {
    const cdnList = episodeData?.cdnList || episodeData?.cdn_list || [];
    if (!Array.isArray(cdnList) || cdnList.length === 0) return undefined;
    
    const preferredCdn = cdnList.find((cdn: any) => cdn?.isDefault === 1) || cdnList[0];
    if (!preferredCdn) return undefined;
    
    const pathList = preferredCdn?.videoPathList || preferredCdn?.video_path_list || [];
    if (!Array.isArray(pathList) || pathList.length === 0) return undefined;
    
    const freePath = pathList.find((path: any) => path?.isVipEquity !== 1);
    const defaultPath = pathList.find((path: any) => path?.isDefault === 1);
    const quality720 = pathList.find((path: any) => path?.quality === 720);
    const preferredPath = freePath || defaultPath || quality720 || pathList[0];
    
    return preferredPath?.videoPath || preferredPath?.url;
  };

  const pickReelshortUrl = (payload: any) => {
    const list = payload?.data?.videoList || payload?.videoList || [];
    const h264 = list.find((item: any) =>
      `${item?.codec || item?.format || ''}`.toLowerCase().includes('h264'),
    );
    return h264?.url || list[0]?.url;
  };

  const toSafeNumber = (value: any, fallback: number) => {
    const parsed = Number.parseInt(String(value ?? ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const isValidVideoUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '') return false;
    if (trimmed.startsWith('http://localhost') || trimmed.startsWith('https://')) {
      return true;
    }
    return false;
  };

  const isHtmlResponse = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<!html');
  };

  const safeJsonParse = async (response: Response): Promise<{ ok: boolean; data: any; error?: string }> => {
    if (!response.ok) {
      return { ok: false, data: null, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    const text = await response.text();
    if (isHtmlResponse(text)) {
      return { ok: false, data: null, error: 'Received HTML instead of JSON - upstream may be down' };
    }
    try {
      const json = JSON.parse(text);
      return { ok: true, data: json };
    } catch {
      return { ok: false, data: null, error: 'Failed to parse JSON response' };
    }
  };

  const extractMovieBoxEpisodes = (payload: any) => {
    const raw =
      payload?.data?.subject ||
      payload?.subject ||
      payload?.data?.detail ||
      payload?.detail ||
      payload?.data ||
      payload;
    const seasonList =
      raw?.seasonList ||
      raw?.seasons ||
      raw?.seasonInfoList ||
      raw?.season ||
      [];
    if (Array.isArray(seasonList) && seasonList.length > 0) {
      return seasonList.flatMap((seasonItem: any) => {
        const seasonNumber = toSafeNumber(
          seasonItem?.season ?? seasonItem?.seasonNumber ?? seasonItem?.seasonIndex ?? seasonItem?.id,
          1,
        );
        const episodeList = seasonItem?.episodes || seasonItem?.episodeList || seasonItem?.episode || [];
        if (!Array.isArray(episodeList) || episodeList.length === 0) {
          return [{ season: seasonNumber, episode: 1, title: seasonItem?.title }];
        }
        return episodeList.map((ep: any, index: number) => ({
          season: seasonNumber,
          episode: toSafeNumber(ep?.episode ?? ep?.episodeNumber ?? ep?.index, index + 1),
          title: ep?.title || ep?.name,
        }));
      });
    }
    return [{ season: 0, episode: 0, title: raw?.title }];
  };

  useEffect(() => {
    loadEpisodes();
  }, [contentId, source]);

  useEffect(() => {
    if (!contentId) return;
    if (source === 'anime') {
      if (episodeParam) loadVideo();
      return;
    }
    if (source === 'moviebox') {
      loadVideo();
      return;
    }
    if (currentEpisode) loadVideo();
  }, [contentId, currentEpisode, currentSeason, episodeParam, source]);

  const loadEpisodes = async () => {
    try {
      let episodesData: any[] = [];

      switch (source) {
        case 'dramabox':
          const response = await fetch(`${API_BASE_URL}/dramabox/allepisode?bookId=${contentId}`);
          if (response.ok) {
            const json = await response.json();
            const rawEpisodes = extractEpisodes(json);
            episodesData = normalizeDramaBoxEpisodes(rawEpisodes);
          }
          break;

        case 'reelshort':
        case 'melolo':
        case 'flickreels':
        case 'freereels':
          const detailKey = source === 'reelshort' || source === 'melolo' ? 'bookId' : 'id';
          const detailResponse = await fetch(`${API_BASE_URL}/${source}/detail?${detailKey}=${contentId}`);
          if (detailResponse.ok) {
            const json = await detailResponse.json();
            episodesData = extractEpisodes(json);
          }
          break;
        
        case 'netshort':
          const netshortDetail = await fetch(`${API_BASE_URL}/netshort/allepisode?shortPlayId=${contentId}`);
          if (netshortDetail.ok) {
            const json = await netshortDetail.json();
            episodesData = extractEpisodes(json);
          }
          break;

        case 'anime':
          const animeDetail = await fetch(`${ANIME_API_URL}/anime/${contentId}`);
          if (animeDetail.ok) {
            const json = await animeDetail.json();
            episodesData = json?.data?.episodeList || json?.data?.episodes || json?.episodes || [];
          }
          break;
        case 'moviebox':
          const movieDetail = await fetch(`${API_BASE_URL}/moviebox/detail?subjectId=${contentId}`);
          if (movieDetail.ok) {
            const json = await movieDetail.json();
            episodesData = extractMovieBoxEpisodes(json);
          }
          break;
      }

      setEpisodes(episodesData);
      if (source === 'anime' && !episodeParam && episodesData.length > 0) {
        const firstId = episodesData[0]?.id;
        if (firstId) {
          searchParams.set('episode', String(firstId));
          setSearchParams(searchParams);
        }
      }
      if (source === 'moviebox' && episodesData.length > 0) {
        const firstEpisode = episodesData[0];
        if (!episodeParam) {
          searchParams.set('episode', String(firstEpisode?.episode ?? 0));
        }
        if (!seasonParam) {
          searchParams.set('season', String(firstEpisode?.season ?? 0));
        }
        setSearchParams(searchParams);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  };

  const loadVideo = async () => {
    setLoading(true);
    setError(null);
    try {
      let videoData: any = null;
      setIsIframe(false);

      switch (source) {
        case 'dramabox': {
          const dramaboxEps = await fetch(`${API_BASE_URL}/dramabox/allepisode?bookId=${contentId}`);
          const parsed = await safeJsonParse(dramaboxEps);
          if (!parsed.ok) {
            setError(`DramaBox: ${parsed.error}`);
            break;
          }
          const episodes = extractEpisodes(parsed.data);
          const episodeNumber = Number(currentEpisode);
          const episode = episodes.find((ep: any) => 
            ep.chapterIndex === episodeNumber - 1 || 
            ep.chapterIndex === episodeNumber ||
            ep.episodeNumber === currentEpisode || 
            ep.number === currentEpisode
          );
          if (episode) {
            videoData = pickDramaBoxUrl(episode);
          }
          break;
        }

        case 'reelshort': {
          const reelshortResponse = await fetch(`${API_BASE_URL}/reelshort/watch?bookId=${contentId}&episodeNumber=${currentEpisode}`);
          const parsed = await safeJsonParse(reelshortResponse);
          if (!parsed.ok) {
            setError(`Reelshort: ${parsed.error}`);
            break;
          }
          videoData = pickReelshortUrl(parsed.data) || extractWatchUrl(parsed.data);
          break;
        }

        case 'melolo': {
          const meloloDetail = await fetch(`${API_BASE_URL}/melolo/detail?bookId=${contentId}`);
          const parsed = await safeJsonParse(meloloDetail);
          if (!parsed.ok) {
            setError(`Melolo: ${parsed.error}`);
            break;
          }
          const episode = extractEpisodes(parsed.data).find((ep: any) => ep.episodeNumber === currentEpisode);
          if (episode && episode.videoId) {
            const streamResponse = await fetch(`${API_BASE_URL}/melolo/stream?videoId=${episode.videoId}`);
            const streamParsed = await safeJsonParse(streamResponse);
            if (!streamParsed.ok) {
              setError(`Melolo Stream: ${streamParsed.error}`);
              break;
            }
            const rawModel = streamParsed.data?.data?.video_model || streamParsed.data?.video_model;
            if (typeof rawModel === 'string') {
              const parsedModel = JSON.parse(rawModel);
              const videoList = parsedModel?.video_list || [];
              const mainUrl = videoList[0]?.main_url || videoList[0]?.mainUrl;
              if (mainUrl) {
                videoData = decodeBase64(mainUrl);
              }
            }
            if (!videoData) {
              videoData = extractWatchUrl(streamParsed.data);
            }
          }
          break;
        }

        case 'flickreels':
        case 'freereels': {
          const reelsDetail = await fetch(`${API_BASE_URL}/${source}/detail?id=${contentId}`);
          const parsed = await safeJsonParse(reelsDetail);
          if (!parsed.ok) {
            setError(`${source}: ${parsed.error}`);
            break;
          }
          const allEps = extractEpisodes(parsed.data);
          const episode = allEps.find((ep: any) => ep.episodeNumber === currentEpisode || ep.number === currentEpisode);
          if (episode) {
            if (source === 'freereels') {
              videoData =
                episode.external_audio_h264_m3u8 ||
                episode.external_audio_h265_m3u8 ||
                episode.videoUrl ||
                episode.url;
            } else {
              videoData = episode.videoUrl || episode.url || episode?.raw?.videoUrl;
            }
          }
          break;
        }

        case 'netshort': {
          const netshortDetail2 = await fetch(`${API_BASE_URL}/netshort/allepisode?shortPlayId=${contentId}`);
          const parsed = await safeJsonParse(netshortDetail2);
          if (!parsed.ok) {
            setError(`Netshort: ${parsed.error}`);
            break;
          }
          const allEps = extractEpisodes(parsed.data);
          const episode = allEps.find((ep: any) => ep.episodeNumber === currentEpisode || ep.number === currentEpisode);
          if (episode) {
            videoData = episode.videoUrl || episode.url;
          }
          break;
        }

        case 'anime':
          if (!episodeParam) break;
          const animeDetailResp = await fetch(`${ANIME_API_URL}/anime/${contentId}`);
          let episodeIdToFetch = episodeParam;
          if (animeDetailResp.ok) {
            const animeJson = await animeDetailResp.json();
            const episodeList = animeJson?.data?.episodeList || animeJson?.data?.episodes || [];
            const targetEpisode = episodeList.find((ep: any) => String(ep.episodeNumber) === String(episodeParam) || String(ep.number) === String(episodeParam) || String(ep.episode) === String(episodeParam));
            if (targetEpisode?.episodeId) {
              episodeIdToFetch = targetEpisode.episodeId;
            }
          }
          const episodeResponse = await fetch(`${ANIME_API_URL}/episode/${episodeIdToFetch}`);
          if (episodeResponse.ok) {
            const json = await episodeResponse.json();
            const qualities = json?.data?.server?.qualities || json?.server?.qualities || [];
            const firstServer = qualities?.[0]?.serverList?.[0] || qualities?.[0]?.servers?.[0] || qualities?.[0];
            const serverId = firstServer?.serverId || firstServer?.id || firstServer?.server_id;
            if (serverId) {
              const serverResponse = await fetch(`${ANIME_API_URL}/server/${serverId}`);
              if (serverResponse.ok) {
                const serverJson = await serverResponse.json();
                videoData = serverJson?.data?.url || serverJson?.url;
              }
            }
          }
          if (videoData) {
            setIsIframe(true);
            setVideoUrl(videoData);
          }
          break;
        case 'moviebox': {
          const sourcesResponse = await fetch(
            `${API_BASE_URL}/moviebox/sources?subjectId=${contentId}&season=${currentSeason}&episode=${currentEpisode}`,
          );
          const parsed = await safeJsonParse(sourcesResponse);
          if (!parsed.ok) {
            setError(`MovieBox: ${parsed.error}`);
            break;
          }
          const payload = parsed.data?.data || parsed.data;
          const downloads = payload?.downloads || payload?.downloadList || payload?.videoList || [];
          let bestDownload = downloads[0];
          if (Array.isArray(downloads) && downloads.length > 0) {
            bestDownload = downloads.reduce((prev: any, curr: any) => {
              const prevRes = Number(prev?.resolution ?? prev?.quality ?? 0);
              const currRes = Number(curr?.resolution ?? curr?.quality ?? 0);
              return currRes > prevRes ? curr : prev;
            }, downloads[0]);
          }
          const rawUrl = bestDownload?.url || bestDownload?.directUrl;
          if (rawUrl) {
            const generateResponse = await fetch(
              `${API_BASE_URL}/moviebox/generate-link-stream-video?url=${encodeURIComponent(rawUrl)}`,
            );
            if (generateResponse.ok) {
              const generateJson = await generateResponse.json();
              videoData = generateJson?.streamUrl || generateJson?.data?.streamUrl || rawUrl;
            } else {
              videoData = rawUrl;
            }
          }
          break;
        }
      }

      if (!videoData && source !== 'anime') {
        if (error) {
          setError(error);
        } else {
          setError('Video not found for this episode');
        }
        return;
      }

      if (videoData && source !== 'anime') {
        if (source === 'flickreels') {
          setVideoUrl(getDirectUrl(videoData));
          return;
        }
        if (source === 'moviebox') {
          setVideoUrl(videoData);
          setIsIframe(false);
          return;
        }
        setVideoUrl(getDirectUrl(videoData));
        return;
      }
    } catch (err) {
      console.error('Error loading video:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const goToEpisode = (episodeValue: number | string, seasonValue?: number) => {
    searchParams.set('episode', String(episodeValue));
    if (seasonValue !== undefined) {
      searchParams.set('season', String(seasonValue));
    }
    setSearchParams(searchParams);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  };

  const currentEpisodeIndex =
    source === 'anime'
      ? episodes.findIndex((ep) => String(ep.id) === String(episodeParam))
      : source === 'moviebox'
      ? episodes.findIndex(
          (ep) => Number(ep.season) === Number(currentSeason) && Number(ep.episode) === Number(currentEpisode),
        )
      : currentEpisode - 1;
  const resolvedEpisodeIndex = currentEpisodeIndex >= 0 ? currentEpisodeIndex : 0;
  const hasNextEpisode = resolvedEpisodeIndex < episodes.length - 1;
  const hasPrevEpisode = resolvedEpisodeIndex > 0;
  const currentEpisodeLabel =
    source === 'anime'
      ? episodes.find((ep) => String(ep.id) === String(episodeParam))?.episodeNumber || resolvedEpisodeIndex + 1
      : source === 'moviebox'
      ? currentSeason > 0
        ? `S${currentSeason}E${currentEpisode}`
        : 'Movie'
      : currentEpisode;
  const detailLink =
    source === 'anime'
      ? `/anime/${contentId}`
      : source === 'moviebox'
      ? `/movie/${contentId}`
      : `/detail/${contentId}?source=${source}`;

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div 
        className="relative bg-black aspect-video max-h-[85vh]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xl">Loading video...</div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]">
            <div className="text-red-500 text-xl font-semibold mb-2">Failed to Load Video</div>
            <div className="text-white/60 text-center max-w-md px-4">{error}</div>
            <button
              onClick={() => {
                setError(null);
                loadVideo();
              }}
              className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {isIframe ? (
              <>
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/70 via-black/20 to-transparent">
                  <Link 
                    to={detailLink}
                    className="text-white hover:text-orange-500 transition flex items-center gap-2"
                  >
                    <ChevronLeft size={24} />
                    <span className="font-semibold">Back to Details</span>
                  </Link>
                  <div className="text-white text-lg font-semibold">
                    Episode {currentEpisodeLabel} of {episodes.length}
                  </div>
                </div>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full"
                  onClick={togglePlay}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  autoPlay
                  controls={false}
                />
                <div 
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
                    <Link 
                      to={detailLink}
                      className="text-white hover:text-orange-500 transition flex items-center gap-2"
                    >
                      <ChevronLeft size={24} />
                      <span className="font-semibold">Back to Details</span>
                    </Link>
                    <div className="text-white text-lg font-semibold">
                      Episode {currentEpisodeLabel} of {episodes.length}
                    </div>
                  </div>

                  {!playing && (
                    <button
                      onClick={togglePlay}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 rounded-full p-6 transition"
                    >
                      <Play size={48} fill="white" className="text-white ml-1" />
                    </button>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-orange-500 transition">
                          {playing ? <Pause size={28} /> : <Play size={28} />}
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-orange-500 transition">
                          {muted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button className="text-white hover:text-orange-500 transition">
                          <Settings size={24} />
                        </button>
                        <button onClick={toggleFullscreen} className="text-white hover:text-orange-500 transition">
                          <Maximize size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Episode Navigation */}
      <div className="px-8 py-6 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Episodes</h2>
          <div className="flex gap-4">
            <button
              onClick={() =>
                hasPrevEpisode &&
                goToEpisode(
                  source === 'anime'
                    ? episodes[resolvedEpisodeIndex - 1]?.id || resolvedEpisodeIndex
                    : source === 'moviebox'
                    ? episodes[resolvedEpisodeIndex - 1]?.episode ?? currentEpisode - 1
                    : currentEpisode - 1,
                  source === 'moviebox' ? episodes[resolvedEpisodeIndex - 1]?.season ?? currentSeason : undefined,
                )
              }
              disabled={!hasPrevEpisode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                hasPrevEpisode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <button
              onClick={() =>
                hasNextEpisode &&
                goToEpisode(
                  source === 'anime'
                    ? episodes[resolvedEpisodeIndex + 1]?.id || resolvedEpisodeIndex + 2
                    : source === 'moviebox'
                    ? episodes[resolvedEpisodeIndex + 1]?.episode ?? currentEpisode + 1
                    : currentEpisode + 1,
                  source === 'moviebox' ? episodes[resolvedEpisodeIndex + 1]?.season ?? currentSeason : undefined,
                )
              }
              disabled={!hasNextEpisode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                hasNextEpisode
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
          {episodes.map((episode, index) => {
            const episodeNum = episode.episodeNumber || episode.number || episode.episode || index + 1;
            const episodeValue =
              source === 'anime'
                ? episode.id || episodeNum
                : source === 'moviebox'
                ? episode.episode ?? episodeNum
                : episodeNum;
            const episodeSeason = source === 'moviebox' ? episode.season ?? currentSeason : undefined;
            const episodeLabel =
              source === 'moviebox'
                ? (episodeSeason ?? 0) > 0
                  ? `S${episodeSeason}E${episodeValue}`
                  : 'Movie'
                : episodeNum;
            return (
              <button
                key={episode.id || index}
                onClick={() => goToEpisode(episodeValue, episodeSeason)}
                className={`p-4 rounded-lg font-semibold transition ${
                  source === 'anime'
                    ? String(episode.id) === String(episodeParam)
                    : source === 'moviebox'
                    ? Number(episodeSeason) === Number(currentSeason) &&
                      Number(episodeValue) === Number(currentEpisode)
                    : episodeNum === currentEpisode
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {episodeLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Info */}
      <div className="px-8 py-4 bg-[#0a0a0a]">
        <p className="text-white/60 text-sm text-center">
          Streaming from <span className="text-orange-500 font-semibold uppercase">{source}</span>
        </p>
      </div>
    </div>
  );
}
