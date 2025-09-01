import { useState } from "react";
import { Button } from "./ui/button";
import { Search, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";

interface SearchResult {
  id: string;
  payload: {
    title: string;
    tagTitles?: string[];
    type: string;
    summary?: string;
    insights?: string;
  };
  score: number;
  relevance: string;
  suggestedUse: string;
}

interface Reference {
  contentId: string;
  title: string;
  relevance: number;
  reason: string;
}

interface IntelligentSearchProps {
  onContentSelect?: (contentId: string) => void;
}

export const IntelligentSearch = ({ onContentSelect }: IntelligentSearchProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "references">("search");
  const [error, setError] = useState("");

  // Get cookie helper function
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Format token helper function
  const formatToken = (token: string): string => {
    if (!token) return "";
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    return `Bearer ${cleanToken}`;
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      let token = localStorage.getItem("token");
      if (!token) {
        token = getCookie('token');
      }

      if (!token) {
        setError("Authentication required");
        return;
      }

      const formattedToken = formatToken(token);
      const response = await axios.post(
        `${BACKEND_URL}/content/search`,
        { query: query.trim(), limit: 10 },
        {
          headers: {
            Authorization: formattedToken,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      setSearchResults(response.data.results || []);
      setActiveTab("search");

    } catch (error: any) {
      console.error("Search error:", error);
      setError(error.response?.data?.error || "Failed to perform search");
    } finally {
      setIsSearching(false);
    }
  };

  const getReferences = async () => {
    if (!query.trim()) return;

    setIsLoadingReferences(true);
    setError("");

    try {
      let token = localStorage.getItem("token");
      if (!token) {
        token = getCookie('token');
      }

      if (!token) {
        setError("Authentication required");
        return;
      }

      const formattedToken = formatToken(token);
      const response = await axios.post(
        `${BACKEND_URL}/content/references`,
        { query: query.trim(), limit: 8 },
        {
          headers: {
            Authorization: formattedToken,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      setReferences(response.data.references || []);
      setActiveTab("references");

    } catch (error: any) {
      console.error("References error:", error);
      setError(error.response?.data?.error || "Failed to get references");
    } finally {
      setIsLoadingReferences(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  };

  const handleContentClick = (contentId: string) => {
    if (onContentSelect) {
      onContentSelect(contentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search your knowledge base with natural language..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent text-gray-800 placeholder-gray-400"
            />
          </div>
          <Button
            onClick={performSearch}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-[#124559] text-white rounded-lg hover:bg-[#01161E] disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </Button>
          <Button
            onClick={getReferences}
            disabled={isLoadingReferences || !query.trim()}
            variant="outline"
            className="px-6 py-3 border-[#124559] text-[#124559] rounded-lg hover:bg-[#124559] hover:text-white disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingReferences ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#124559]"></div>
                Loading...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Get References
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results Tabs */}
      {(searchResults.length > 0 || references.length > 0) && (
        <div className="border border-gray-200 rounded-lg">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === "search"
                  ? "text-[#124559] border-b-2 border-[#124559]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search size={16} className="inline mr-2" />
              Search Results ({searchResults.length})
            </button>
            <button
              onClick={() => setActiveTab("references")}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === "references"
                  ? "text-[#124559] border-b-2 border-[#124559]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen size={16} className="inline mr-2" />
              Intelligent References ({references.length})
            </button>
          </div>

          {/* Search Results */}
          {activeTab === "search" && searchResults.length > 0 && (
            <div className="p-4 space-y-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#124559] transition-colors cursor-pointer"
                  onClick={() => handleContentClick(result.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{result.payload.title}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {result.payload.type}
                    </span>
                  </div>
                  
                  {result.payload.tagTitles && result.payload.tagTitles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {result.payload.tagTitles.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {result.payload.summary && (
                    <p className="text-gray-600 text-sm mb-3">{result.payload.summary}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Relevance:</strong> {result.relevance}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Suggested Use:</strong> {result.suggestedUse}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Similarity Score: {(result.score * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Intelligent References */}
          {activeTab === "references" && references.length > 0 && (
            <div className="p-4 space-y-4">
              {references.map((reference) => (
                <div
                  key={reference.contentId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#124559] transition-colors cursor-pointer"
                  onClick={() => handleContentClick(reference.contentId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{reference.title}</h3>
                    <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
                      {(reference.relevance * 100).toFixed(0)}% relevant
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">{reference.reason}</p>
                  
                  <div className="mt-3 text-xs text-gray-400">
                    AI-powered relevance analysis
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {((activeTab === "search" && searchResults.length === 0 && !isSearching) ||
        (activeTab === "references" && references.length === 0 && !isLoadingReferences)) && (
        <div className="text-center py-8 text-gray-500">
          <Search size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No results found. Try a different search query or get intelligent references.</p>
        </div>
      )}
    </div>
  );
}; 