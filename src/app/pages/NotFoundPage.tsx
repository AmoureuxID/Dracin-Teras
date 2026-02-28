import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-white/80 text-xl mb-8">Page Not Found</p>
        <Link
          to="/"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-semibold transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
