import { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

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

interface ShareResponse {
  shareUrl: string;
}

interface UseShareReturn {
  shareContent: (contentId: string) => Promise<string | null>;
  isSharing: boolean;
  error: string | null;
  clearError: () => void;
}

export const useShare = (): UseShareReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareContent = async (contentId: string): Promise<string | null> => {
    setIsSharing(true);
    setError(null);

    try {
      // Get token from localStorage or cookies
      let token = localStorage.getItem("token");
      if (!token) {
        token = getCookie('token');
      }

      if (!token) {
        throw new Error("You must be logged in to share content");
      }

      const formattedToken = formatToken(token);

      const response = await axios.post<ShareResponse>(
        `${BACKEND_URL}/brain/share`,
        { contentId },
        {
          headers: {
            Authorization: formattedToken,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );
      console.log("the url is in the content",response.data)
      return response.data.shareUrl; 

    } catch (err) {
      setIsSharing(false);
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response?.status === 404) {
          setError("Content not found or you don't have permission to share it.");
        } else if (err.response?.status === 500) {
          setError("Failed to create shareable link. Please try again.");
        } else {
          setError(err.response?.data?.error || "Failed to share content");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while sharing");
      }
      
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    shareContent,
    isSharing,
    error,
    clearError
  };
};