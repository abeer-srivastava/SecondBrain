import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../config';

interface SharedContent {
  id: string;
  title: string;
  content: string;
  type: string;
  url?: string;
  tags: string[];
  createdAt: string;
}

interface SharedBrainData {
  id: string;
  ownerName: string;
  title: string;
  description: string;
  content: SharedContent[];
  createdAt: string;
}

const SharedBrainView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [sharedBrain, setSharedBrain] = useState<SharedBrainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (shareId) {
      console.log("the shared hash in the sharedBrain",shareId);
      fetchSharedBrain(shareId);
    }
  }, [shareId]);

  const fetchSharedBrain = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // This endpoint should be public - no authentication required
      const response = await axios.get(`${BACKEND_URL}/brain/shareLink/${id}`);
      setSharedBrain(response.data);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("This shared brain could not be found or may have been removed.");
        } else if (err.response?.status === 403) {
          setError("This shared brain is no longer available.");
        } else {
          setError("Failed to load the shared brain. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred while loading the shared brain.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tweet':
      case 'twitter':
        return '🐦';
      case 'video':
      case 'youtube':
        return '📹';
      case 'document':
      case 'article':
      case 'pdf':
        return '📄';
      case 'link':
      case 'url':
        return '🔗';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124559] mx-auto mb-4 bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]"></div>
          <p className="text-[#124559] font-semibold">Loading shared brain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-[#01161E] mb-4">Oops!</h2>
          <p className="text-[#598392] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#124559] text-[#EFF6E0] px-6 py-2 rounded-lg hover:bg-[#01161E] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!sharedBrain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-[#01161E] mb-4">Brain Not Found</h2>
          <p className="text-[#598392]">This shared brain could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0] shadow-sm border-b border-[#AEC3B0]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className=''>
              <h1 className="text-2xl font-bold text-[#01161E] mb-1 ">
                🧠 {sharedBrain.title || `${sharedBrain.ownerName}'s Second Brain`}
              </h1>
              <p className="text-[#598392]">
                Shared by {sharedBrain.ownerName} • {formatDate(sharedBrain.createdAt)}
              </p>
              {sharedBrain.description && (
                <p className="text-[#124559] mt-2">{sharedBrain.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-[#EFF6E0] px-3 py-1 rounded-full text-sm text-[#124559]">
                {sharedBrain.content.length} items
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {sharedBrain.content.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-[#01161E] mb-2">No Content Yet</h3>
            <p className="text-[#598392]">This brain doesn't have any content to share yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedBrain.content.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0] rounded-lg shadow-sm border border-[#AEC3B0] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getContentTypeIcon(item.type)}</span>
                    <span className="text-sm text-[#598392] capitalize">{item.type}</span>
                  </div>
                  <span className="text-xs text-[#AEC3B0]">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <h3 className="font-semibold text-[#01161E] mb-2 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-[#598392] text-sm mb-4 line-clamp-3">
                  {item.content}
                </p>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#124559] hover:text-[#01161E] text-sm font-medium transition-colors"
                  >
                    🔗 View Original
                  </a>
                )}

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#EFF6E0] text-[#124559] text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-[#AEC3B0] text-xs px-2 py-1">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className=" flex flex-col bg-gradient-to-br from-[#EFF6E0] to-[#AEC3C1] border-t border-[#AEC3B0] ">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center justify-end items-end">
          <p className="text-[#598392] text-sm ">
            This is a shared Second Brain. Want to create your own?{' '}
            <Link
              to="/"
              className="text-[#124559] hover:text-[#01161E] font-medium transition-colors"
            >
              Get started here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedBrainView;
