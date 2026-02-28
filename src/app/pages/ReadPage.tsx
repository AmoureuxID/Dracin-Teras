import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { fetchKomikChapter, type KomikChapterDetail } from '../utils/api';

export function ReadPage() {
  const { slug, chapterId } = useParams<{ slug: string; chapterId: string }>();
  const [chapter, setChapter] = useState<KomikChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;
    const loadChapter = async () => {
      setLoading(true);
      const data = await fetchKomikChapter(chapterId);
      setChapter(data);
      setLoading(false);
    };
    loadChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Chapter not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <Link to={`/komik/${slug}`} className="flex items-center gap-2 text-white/80 hover:text-red-400 transition">
            <ArrowLeft size={20} />
            Back to Detail
          </Link>
          <div className="flex items-center gap-2 font-semibold">
            <BookOpen size={18} />
            {chapter.title}
          </div>
          <div className="flex items-center gap-3">
            {chapter.prevChapter && (
              <Link
                to={`/read/${slug}/${chapter.prevChapter}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <ArrowLeft size={16} />
                Prev
              </Link>
            )}
            {chapter.nextChapter && (
              <Link
                to={`/read/${slug}/${chapter.nextChapter}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
              >
                Next
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-12 py-8 space-y-6">
        {chapter.images?.map((image, index) => (
          <div key={`${chapter.slug}-${index}`} className="flex justify-center">
            <img
              src={image}
              alt={`page-${index + 1}`}
              className="max-w-full rounded-lg shadow-lg"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x1200?text=Image+Not+Available';
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 py-8">
        {chapter.prevChapter && (
          <Link
            to={`/read/${slug}/${chapter.prevChapter}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft size={18} />
            Previous Chapter
          </Link>
        )}
        {chapter.nextChapter && (
          <Link
            to={`/read/${slug}/${chapter.nextChapter}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Next Chapter
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
