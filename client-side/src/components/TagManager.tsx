import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";

interface Tag {
  _id: string;
  name: string;
}

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagManager = ({ selectedTags, onTagsChange }: TagManagerProps) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  // Fetch available tags
  const fetchTags = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        token = getCookie('token');
      }
      
      if (!token) return;

      const formattedToken = formatToken(token);
      const response = await axios.get(`${BACKEND_URL}/tags`, {
        headers: {
          Authorization: formattedToken,
        },
        withCredentials: true
      });
      
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Create new tag
  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsLoading(true);
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
        `${BACKEND_URL}/tags`,
        { name: newTagName.trim() },
        {
          headers: {
            Authorization: formattedToken,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );
      
      setNewTagName("");
      await fetchTags(); // Refresh tags list
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError("Tag already exists");
      } else {
        setError("Failed to create tag");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add tag to selection
  const addTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  // Remove tag from selection
  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  // Handle Enter key for creating tags
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createTag();
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Tags
        </label>
        
        {/* Selected tags display */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Create new tag */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Create new tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent"
          />
          <Button
            type="button"
            onClick={createTag}
            disabled={isLoading || !newTagName.trim()}
            className="px-4 py-2 bg-[#124559] text-white rounded-lg hover:bg-[#01161E] disabled:opacity-50"
          >
            {isLoading ? "..." : <Plus size={16} />}
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}

        {/* Available tags */}
        {availableTags.length > 0 && (
          <div>
            <p className="text-gray-600 text-xs mb-2">Available tags:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags
                .filter(tag => !selectedTags.includes(tag.name))
                .map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => addTag(tag.name)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    + {tag.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 