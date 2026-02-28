import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, Maximize, Play, Pause } from 'lucide-react';
import { API_BASE_URL, BACKEND_API_BASE_URL } from '../utils/env';
import type { Episode } from '../utils/api';

export function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentEpisode = parseInt(searchParams.get('episode') || '1');
  const source = searchParams.get('source') || 'dramabox';
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const extractEpisodes = (payload: any): any[] => {
    const fromData = payload?.data;
    return (
      payload?.allEpisodes ||
      payload?.episodes ||
      fromData?.allEpisodes ||
      fromData?.episodes ||
      (Array.isArray(fromData) ? fromData : null) ||
      (Array.isArray(payload) ? payload : [])
    );
  };

  const extractWatchUrl = (payload: any): string | undefined => {
    const fromData = payload?.data;
    return payload?.videoUrl || payload?.url || fromData?.videoUrl || fromData?.url;
  };

  useEffect(() => {
    loadEpisodes();
  }, [id, source]);

  useEffect(() => {
    if (currentEpisode) {
      loadVideo();
    }
  }, [currentEpisode, source]);

  const loadEpisodes = async () => {
    try {
      let episodesData: any[] = [];

      switch (source) {
        case 'dramabox':
          const response = await fetch(`${API_BASE_URL}/dramabox/allepisode/${id}`);
          if (response.ok) {
            const json = await response.json();
            episodesData = extractEpisodes(json);
          }
          break;

        case 'reelshort':
        case 'melolo':
        case 'flickreels':
        case 'freereels':
          // These providers return episodes with detail
          const detailResponse = await fetch(`${API_BASE_URL}/${source}/detail?${source === 'dramabox' || source === 'reelshort' || source === 'melolo' ? 'bookId' : 'id'}=${id}`);
          if (detailResponse.ok) {
            const json = await detailResponse.json();
            episodesData = extractEpisodes(json);
          }
          break;
      }

      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  };

  const loadVideo = async () => {
    setLoading(true);
    try {
      let videoData: any = null;

      switch (source) {
        case 'dramabox':
          // DramaBox menggunakan allepisode untuk mendapatkan video URL
          const dramaboxEps = await fetch(`${API_BASE_URL}/dramabox/allepisode/${id}`);
          if (dramaboxEps.ok) {
            const json = await dramaboxEps.json();
            const episodes = extractEpisodes(json);
            const episode = episodes.find((ep: any) => ep.episodeNumber === currentEpisode || ep.number === currentEpisode);
            if (episode) {
              videoData = episode.videoUrl || episode.url;
            }
          }
          break;

        case 'reelshort':
          const reelshortResponse = await fetch(`${API_BASE_URL}/reelshort/watch?bookId=${id}&episodeNumber=${currentEpisode}`);
          if (reelshortResponse.ok) {
            const json = await reelshortResponse.json();
            videoData = extractWatchUrl(json);
          }
          break;

        case 'melolo':
          // Melolo uses stream endpoint with videoId
          const meloloDetail = await fetch(`${API_BASE_URL}/melolo/detail?bookId=${id}`);
          if (meloloDetail.ok) {
            const json = await meloloDetail.json();
            const episode = extractEpisodes(json).find((ep: any) => ep.episodeNumber === currentEpisode);
            if (episode && episode.videoId) {
              const streamResponse = await fetch(`${API_BASE_URL}/melolo/stream?videoId=${episode.videoId}`);
              if (streamResponse.ok) {
                const streamJson = await streamResponse.json();
                videoData = extractWatchUrl(streamJson);
              }
            }
          }
          break;

        case 'flickreels':
        case 'freereels':
          // FlickReels & FreeReels have embedded video URLs in episodes
          const reelsDetail = await fetch(`${API_BASE_URL}/${source}/detail?id=${id}`);
          if (reelsDetail.ok) {
            const json = await reelsDetail.json();
            const allEps = extractEpisodes(json);
            const episode = allEps.find((ep: any) => ep.episodeNumber === currentEpisode || ep.number === currentEpisode);
            if (episode) {
              videoData = episode.videoUrl || episode.url;
            }
          }
          break;
      }

      if (videoData) {
        // Use proxy if needed for CORS
        const proxyUrl = `${BACKEND_API_BASE_URL}/proxy/video?url=${encodeURIComponent(videoData)}`;
        setVideoUrl(proxyUrl);
      } else {
        // Fallback to demo video
        setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      }
    } catch (error) {
      console.error('Error loading video:', error);
      // Fallback video
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    } finally {
      setLoading(false);
    }
  };

  const goToEpisode = (episodeNumber: number) => {
    searchParams.set('episode', episodeNumber.toString());
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

  const hasNextEpisode = currentEpisode < episodes.length;
  const hasPrevEpisode = currentEpisode > 1;

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

            {/* Custom Video Controls */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
                <Link 
                  to={`/detail/${id}?source=${source}`}
                  className="text-white hover:text-orange-500 transition flex items-center gap-2"
                >
                  <ChevronLeft size={24} />
                  <span className="font-semibold">Back to Details</span>
                </Link>
                <div className="text-white text-lg font-semibold">
                  Episode {currentEpisode} of {episodes.length}
                </div>
              </div>

              {/* Center Play Button */}
              {!playing && (
                <button
                  onClick={togglePlay}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 rounded-full p-6 transition"
                >
                  <Play size={48} fill="white" className="text-white ml-1" />
                </button>
              )}

              {/* Bottom Controls */}
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
      </div>

      {/* Episode Navigation */}
      <div className="px-8 py-6 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Episodes</h2>
          <div className="flex gap-4">
            <button
              onClick={() => hasPrevEpisode && goToEpisode(currentEpisode - 1)}
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
              onClick={() => hasNextEpisode && goToEpisode(currentEpisode + 1)}
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
            const episodeNum = episode.episodeNumber || episode.number || index + 1;
            return (
              <button
                key={index}
                onClick={() => goToEpisode(episodeNum)}
                className={`p-4 rounded-lg font-semibold transition ${
                  episodeNum === currentEpisode
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {episodeNum}
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
