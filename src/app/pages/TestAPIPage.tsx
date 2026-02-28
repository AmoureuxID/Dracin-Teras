import { useState } from 'react';
import { API_BASE_URL } from '../utils/env';

export function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = API_BASE_URL;

  const testAPI = async (endpoint: string, label: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, { mode: 'cors' });
      const data = await response.json();
      setResult({ label, data });
      console.log(`${label}:`, data);
    } catch (error) {
      setResult({ label, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Test Anime API</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => testAPI('/anime/samehadaku/schedule', 'SCHEDULE')}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
          disabled={loading}
        >
          Test Schedule
        </button>
        
        <button
          onClick={() => testAPI('/anime/samehadaku/list', 'LIST')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          disabled={loading}
        >
          Test List
        </button>
        
        <button
          onClick={() => testAPI('/anime/samehadaku/genres', 'GENRES')}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg"
          disabled={loading}
        >
          Test Genres
        </button>

        <button
          onClick={() => testAPI('/anime/samehadaku/genres/action?page=1', 'GENRE DETAIL (Action)')}
          className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg"
          disabled={loading}
        >
          Test Genre Detail
        </button>

        <button
          onClick={() => testAPI('/anime/samehadaku/ongoing?page=1', 'ONGOING')}
          className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg"
          disabled={loading}
        >
          Test Ongoing
        </button>
      </div>

      {loading && (
        <div className="text-xl text-gray-400">Loading...</div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">{result.label}</h2>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
