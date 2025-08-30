import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { BACKEND_URL } from '../../config';

// Helper function to get cookie value by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to format token properly
const formatToken = (token: string): string => {
  if (!token) return "";
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  return `Bearer ${cleanToken}`;
};

interface SharedBrain {
  id: string;
  shareUrl: string;
  createdAt: string;
  isActive: boolean;
}

const ShareBrain = () => {
  const [sharedBrains, setSharedBrains] = useState<SharedBrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedBrains();
  }, []);

  const fetchSharedBrains = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token from localStorage or cookies
      let token = localStorage.getItem("token");
      if (!token) {
        token = getCookie('token');
      }

      if (!token) {
        setError("You must be logged in to view shared brains");
        setIsLoading(false);
        return;
      }

      const formattedToken = formatToken(token);

      const response = await axios.get(`${BACKEND_URL}/brain/shared`, {
        headers: {
          Authorization: formattedToken,
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      setSharedBrains(response.data.sharedBrains || []);

    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response?.status === 404) {
          setError("No shared brains found.");
        } else {
          setError(err.response?.data?.error || "Failed to fetch shared brains");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  const revokeShare = async (shareId: string) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        token = getCookie('token');
      }

      if (!token) {
        setError("You must be logged in to revoke shares");
        return;
      }

      const formattedToken = formatToken(token);

      await axios.delete(`${BACKEND_URL}/brain/share/${shareId}`, {
        headers: {
          Authorization: formattedToken,
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      // Refresh the list
      fetchSharedBrains();
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to revoke share");
      } else {
        setError("An unexpected error occurred while revoking share");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124559] mx-auto mb-4"></div>
          <p className="text-[#124559] font-semibold">Loading shared brains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#01161E] mb-2">🔗 Shared Brains</h1>
              <p className="text-[#598392]">Manage your shared Second Brain links</p>
            </div>
            <Button
              onClick={fetchSharedBrains}
              className="bg-[#124559] text-[#EFF6E0] hover:bg-[#01161E]"
            >
              🔄 Refresh
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {sharedBrains.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-[#01161E] mb-2">No Shared Brains Yet</h3>
              <p className="text-[#598392] mb-4">
                You haven't created any shareable links for your Second Brain yet.
              </p>
              <p className="text-sm text-[#598392]">
                Use the "Share Brain" button in the main dashboard to create your first shareable link.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedBrains.map((brain) => (
                <div
                  key={brain.id}
                  className="border border-[#AEC3B0] rounded-lg p-4 bg-[#EFF6E0]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔗</span>
                        <span className="font-medium text-[#01161E]">
                          Shared Brain Link
                        </span>
                        {brain.isActive && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="bg-white border rounded-lg p-3 mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={brain.shareUrl}
                            readOnly
                            className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700"
                          />
                          <Button
                            onClick={() => copyToClipboard(brain.shareUrl)}
                            size="sm"
                            className="bg-[#124559] text-[#EFF6E0] hover:bg-[#01161E]"
                          >
                            📋 Copy
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-[#598392]">
                        Created: {new Date(brain.createdAt).toLocaleDateString()} at{' '}
                        {new Date(brain.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button
                        onClick={() => window.open(brain.shareUrl, '_blank')}
                        size="sm"
                        variant="default"
                        className="border-[#124559] text-[#124559] hover:bg-[#124559] hover:text-[#EFF6E0]"
                      >
                        👁️ Preview
                      </Button>
                      <Button
                        onClick={() => revokeShare(brain.id)}
                        size="sm"
                        variant="neutral"
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        🗑️ Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareBrain;