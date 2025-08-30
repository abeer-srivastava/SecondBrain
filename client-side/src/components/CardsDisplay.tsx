import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  NotebookText, 
  Share2, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Video, 
  Link as LinkIcon,
  Globe,
  Calendar,
  Tag
} from 'lucide-react';

import axios from "axios";

import { BACKEND_URL } from "../config.ts";
import { Button } from "./ui/button.tsx";
import CreateSharableBrain from "./CreateSharableBrain.tsx";

interface ContentItem {
  _id: string;
  title: string;
  link: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  previewImage?: string;
  description?: string;
}

export interface CardsDisplayRef {
  fetchContent: () => void;
}

export interface CardsDisplayProps {
  activeFilter?: string;
}

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

const CardsDisplay = forwardRef<CardsDisplayRef, CardsDisplayProps>(({ activeFilter = "all" }, ref) => {

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  // Fetch content from database
  const fetchContent = async () => {
    try {
      // Check for token in localStorage first
      let token = localStorage.getItem("token");
      
      // If no token in localStorage, check cookies
      if (!token) {
        token = getCookie('token');
      }
      
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      // Format the token properly
      const formattedToken = formatToken(token);

      const response = await axios.get(`${BACKEND_URL}/content`, {
        headers: {
          Authorization: formattedToken,
        },
        withCredentials: true // Enable cookies for this request
      });

      setContentItems(response.data);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error("Error fetching content:", err);
      setError("Failed to load content");
      setIsLoading(false);
    }
  };

  // Expose fetchContent method to parent component
  useImperativeHandle(ref, () => ({
    fetchContent
  }));

  useEffect(() => {
    fetchContent();
  }, []);

  // Delete content item
  const handleDelete = async (id: string) => {
    try {
      // Check for token in localStorage first
      let token = localStorage.getItem("token");
      
      // If no token in localStorage, check cookies
      if (!token) {
        token = getCookie('token');
      }
      
      if (!token) {
        setError("Authentication required");
        return;
      }
      
      // Format the token properly
      const formattedToken = formatToken(token);
      
      await axios.delete(`${BACKEND_URL}/content`,{
        data: {
          contentId: id,  // Changed from 'id' to 'contentId' to match backend
        },
        headers: {
          Authorization: formattedToken,
        },
        withCredentials: true // Enable cookies for this request
      });
      
      // Refresh the content list
      fetchContent();
    } catch (err: unknown) {
      console.error("Error deleting content:", err);
      setError("Failed to delete content");
    }
  };

  // Get icon based on content type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return <FileText className="mr-3 h-5 w-5 text-[#124559]" />;
      case 'video':
        return <Video className="mr-3 h-5 w-5 text-[#124559]" />;
      case 'link':
        return <LinkIcon className="mr-3 h-5 w-5 text-[#124559]" />;
      case 'document':
        return <NotebookText className="mr-3 h-5 w-5 text-[#124559]" />;
      case 'note':
        return <NotebookText className="mr-3 h-5 w-5 text-[#124559]" />;
      default:
        return <Globe className="mr-3 h-5 w-5 text-[#124559]" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Simple and reliable preview image function (no hooks needed)
  const getPreviewImage = (url: string) => {
    if (!url) {
      return `https://via.placeholder.com/300x200/124559/ffffff?text=${encodeURIComponent('No URL')}`;
    }

    try {
      // Validate URL first
      const validUrl = new URL(url);
      const domain = validUrl.hostname.replace('www.', '');
      
      // Use a simple approach that works reliably
      // Option 1: Try favicon (most reliable, no CORS issues)
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      
      // Alternative: Use placeholder with domain name
      // return `https://via.placeholder.com/300x200/124559/ffffff?text=${encodeURIComponent(domain)}`;
      
    } catch (error:any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // If URL is invalid, use placeholder
      console.log(error)
      return `https://via.placeholder.com/300x200/124559/ffffff?text=${encodeURIComponent('Invalid URL')}`;
    }
  };

  // Handle external link click
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124559] mx-auto mb-4"></div>
          <p className="text-[#124559] font-semibold">Loading your content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button 
            onClick={fetchContent}
            className="bg-[#124559] text-[#EFF6E0] px-4 py-2 rounded-lg hover:bg-[#01161E] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (contentItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <NotebookText className="h-16 w-16 text-[#AEC3B0] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#124559] mb-2">No content yet</h3>
          <p className="text-[#598392] mb-4">Start building your second brain by adding your first piece of content.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#124559] text-[#EFF6E0] px-6 py-3 rounded-lg hover:bg-[#01161E] transition-colors font-semibold"
          >
            Add Your First Content
          </button>
        </div>
      </div>
    );
  }

  // Define common card styling
  const commonCardClasses = "bg-[#EFF6E0] border-[#AEC3B0] hover:border-[#598392] transition-all duration-200 rounded-lg shadow-sm hover:shadow-md overflow-hidden cursor-pointer";
  const commonHeaderClasses = "text-[#01161E] p-6 pb-4 border-b border-[#AEC3B0]";
  const commonTitleClasses = "text-[#124559] px-6 pt-4 text-xl font-bold";
  const commonFooterClasses = "text-[#598392] px-6 pt-2 pb-6 text-sm border-t border-[#AEC3B0] bg-[#AEC3B0]/20";

  // Filter content based on activeFilter
  const getFilteredContent = () => {
    if (activeFilter === "all") {
      return contentItems;
    }
    
    // Map sidebar filter names to content types
    const filterMap: { [key: string]: string[] } = {
      "tweets": ["tweet", "twitter"],
      "videos": ["video", "youtube"],
      "documents": ["document", "article", "pdf"],
      "links": ["link", "url"],
      "tags": [] // Handle tags separately if needed
    };
    
    const allowedTypes = filterMap[activeFilter] || [activeFilter];
    return contentItems.filter(item => 
      allowedTypes.some(type => 
        item.type.toLowerCase().includes(type.toLowerCase())
      )
    );
  };

  const filteredContentItems = getFilteredContent();

  return (
    <div className="space-y-6">
      {/* Header with content count */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#01161E]">
          Your Content ({filteredContentItems.length})
        </h2>
        <div className="flex items-center gap-2 text-[#598392]">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Last updated: {formatDate(filteredContentItems[0]?.updatedAt || new Date().toISOString())}</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid auto-rows-min gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-[calc(100vh-200px)] overflow-y-auto">
        {filteredContentItems.map((item) => {
          const imageUrl = getPreviewImage(item.link);

          return (
            <Card key={item._id} className={commonCardClasses }>
              {/* Preview Image */}
              <div className="relative h-30 overflow-hidden flex bg-[#AEC3B0]/20">
                <div className="flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="  w-full h-48 object-cover hover:scale-105 transition-transform duration-300 "
                />
                </div>

                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExternalLink(item.link);
                    }}
                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="h-4 w-4 text-[#124559]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                    className="p-2 bg-white/90 rounded-full hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Card Header */}
              <CardHeader className={commonHeaderClasses}>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    {getTypeIcon(item.type)}
                    <h1 className="text-lg font-semibold text-[#01161E] capitalize">{item.type}</h1>
                  </div>
                  <Button onClick={()=>{
                    setSelectedContentId(item._id);
                    setIsShareOpen(true)
                    }} className="flex items-center gap-2 border-0 hover:bg-[#124559] rounded-3xl text-[#598392]">
                    <Share2 className="h-4 w-4 text-[#598392] hover:text-[#124559] cursor-pointer transition-colors" />
                  </Button>
                </div>
              </CardHeader>

              {/* Card Title */}
              <CardTitle className={commonTitleClasses}>{item.title}</CardTitle>

              {/* Card Content */}
             

              {/* Card Footer */}
              <CardFooter className={commonFooterClasses}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-[#598392]" />
                    <span className="text-xs text-[#598392]">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-[#598392]" />
                    <span className="text-xs text-[#598392] capitalize">{item.type}</span>
                  </div>
                </div>
              </CardFooter>
              <CreateSharableBrain 
                open={isShareOpen} 
                onClose={() =>
                  setIsShareOpen(false)
                  } 
                  contentId={selectedContentId}
                />
            </Card>
            
          );
        })}
      </div>
    </div>
  );
});

CardsDisplay.displayName = 'CardsDisplay';

export default CardsDisplay;
