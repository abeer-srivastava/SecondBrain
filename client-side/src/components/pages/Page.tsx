import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config.ts";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../sidebar";
import Navbar from "../Navbar";
import CardsDisplay from "../CardsDisplay"
import { CreateContentModal } from "../CreateContentModal"
import CreateSharableBrain from "../CreateSharableBrain"

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
  // Remove any existing Bearer prefix
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  // Add Bearer prefix
  return `Bearer ${cleanToken}`;
};

export default function Page() {
  const navigate = useNavigate();
  const [openModal, setopenModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const cardsDisplayRef = useRef<{ fetchContent: () => void }>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  useEffect(() => {
    validateToken();
  }, [navigate]);

  const validateToken = async () => {
    try {
      // Check for token in localStorage first
      let token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);
      
      // If no token in localStorage, check cookies
      if (!token) {
        token = getCookie('token');
        console.log("Token from cookie:", token);
        setDebugInfo("Token found in cookie");
      }
      
      setDebugInfo(`Token exists: ${!!token}`);
      console.log("Token length:", token ? token.length : 0);
      console.log("Token starts with 'Bearer':", token ? token.startsWith('Bearer ') : false);
      
      if (!token) {
        console.log("No token found, redirecting to signin");
        setDebugInfo("No token found, redirecting to signin");
        navigate("/signin");
        return;
      }

      // Format the token properly
      const formattedToken = formatToken(token);
      console.log("Formatted token:", formattedToken);

      // Validate token by making a test request to the backend
      console.log("Validating token...");
      console.log("Making request to:", `${BACKEND_URL}/content`);
      console.log("Authorization header:", formattedToken);
      setDebugInfo("Validating token...");
      
      const response = await axios.get(`${BACKEND_URL}/content`, {
        headers: {
          Authorization: formattedToken,
        },
        withCredentials: true // Enable cookies for this request
      });

      // If we get here, the token is valid
      console.log("Token is valid, user authenticated");
      console.log("Response data:", response.data);
      setDebugInfo("Token is valid, user authenticated");
      setIsAuthenticated(true);
      setIsLoading(false);
      setAuthError("");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Token validation failed:", err);
      console.log("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      
      if (err.response?.status === 401) {
        console.log("Token is invalid or expired");
        setDebugInfo("Token is invalid or expired");
        setAuthError("Your session has expired. Please log in again.");
        localStorage.removeItem("token"); // Clear invalid token
        // Also clear the cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else if (err.request) {
        console.log("Network error during token validation");
        setDebugInfo("Network error during token validation");
        setAuthError("Network error. Please check your connection.");
        // Don't redirect on network errors, just show error
        setIsLoading(false);
      } else {
        console.log("Other error during token validation");
        setDebugInfo("Other error during token validation");
        setAuthError("Authentication error. Please try again.");
        setIsLoading(false);
      }
    }
  };



  const handleOpenModel = () => {
    setopenModal(true);
  };

const handleOpenShareModal = (contentId: string) => {
  setSelectedContentId(contentId);
  setOpenShareModal(true);
};

  // Callback to refresh content after adding new content
  const handleContentAdded = () => {
    if (cardsDisplayRef.current) {
      cardsDisplayRef.current.fetchContent();
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124559] mx-auto mb-4"></div>
          <p className="text-[#124559] font-semibold">Validating your session...</p>
          {debugInfo && (
            <p className="text-[#598392] text-sm mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  // Show authentication error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 font-semibold mb-4">{authError}</p>
            {debugInfo && (
              <p className="text-[#598392] text-sm mb-4">{debugInfo}</p>
            )}
            <div className="flex gap-2 justify-center">
              <button 
                onClick={validateToken}
                className="bg-[#124559] text-[#EFF6E0] px-4 py-2 rounded-lg hover:bg-[#01161E] transition-colors"
              >
                Try Again
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <CreateContentModal 
        open={openModal} 
        onClose={() => setopenModal(false)} 
        onContentAdded={handleContentAdded}
      />
      <CreateSharableBrain 
        open={openShareModal} 
        onClose={() => setOpenShareModal(false)}
        contentId={selectedContentId} 
      />
      <SidebarProvider>
        <AppSidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-[#EFF6E0] border-b border-[#AEC3B0]">
            <div className="flex items-center px-4">
              <SidebarTrigger className="text-[#124559] hover:text-[#01161E] mr-4" />
            </div>
            <Navbar 
              onAddContentClick={handleOpenModel} 
              onShareContentClick={(id) => handleOpenShareModal(id)} 
              currentContentId={selectedContentId as string} 
/>
          </header>
          <div className="min-h-[100vh] flex-1 rounded-base bg-[#EFF6E0] md:min-h-min">
            <div className="flex flex-1 flex-col p-6 pt-8">
              <CardsDisplay ref={cardsDisplayRef} activeFilter={activeFilter} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
