import { X } from "lucide-react";
import { Button } from "./ui/button";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface IProps {
  title: string;
  link: string;
  type: string;
}

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onContentAdded?: () => void; // Callback to refresh content list
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

export const CreateContentModal = ({
  open,
  onClose,
  onContentAdded
}: CreateContentModalProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IProps>();

  const onSubmit: SubmitHandler<IProps> = async (data) => {
    setError("");
    setIsLoading(true);

    // Check if user is authenticated
    let token = localStorage.getItem("token");
    if (!token) {
      token = getCookie('token');
    }
    
    if (!token) {
      setError("You must be logged in to add content. Redirecting to login...");
      setIsLoading(false);
      setTimeout(() => {
        navigate("/signin");
        onClose();
      }, 2000);
      return;
    }

    try {
      console.log("Adding content:", data);
      
      // Format the token properly
      const formattedToken = formatToken(token);
      
      const response = await axios.post(
        `${BACKEND_URL}/content`,
        data,
        {
          headers: {
            Authorization: formattedToken,
            "Content-Type": "application/json"
          },
          withCredentials: true // Enable cookies for this request
        }
      );
      
      console.log("Content added successfully:", response.data);
      
      // Reset form
      reset();
      
      // Close modal
      onClose();
      
      // Refresh content list if callback provided
      if (onContentAdded) {
        onContentAdded();
      }
    } catch (err) {
      console.error("Error adding content:", err);
      setIsLoading(false);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          localStorage.removeItem("token"); // Clear invalid token
          // Also clear the cookie
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          setTimeout(() => {
            navigate("/signin");
            onClose();
          }, 2000);
        } else if (err.response?.status === 400) {
          const errorMessage = err.response.data?.message || "Please check your input and try again.";
          setError(errorMessage);
        } else if (err.response?.status === 403) {
          setError("You don't have permission to add content.");
        } else if (err.response?.status === 409) {
          setError("This content already exists.");
        } else {
          setError(`Failed to add content: ${err.response?.data?.message || 'Unknown error'}`);
        }
      } else if (err instanceof Error) {
        setError("An unexpected error occurred. Please try again.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    reset();
    setError("");
    onClose();
  };

  const validateTokenBeforeSubmit = async () => {
    let token = localStorage.getItem("token");
    if (!token) {
      token = getCookie('token');
    }
    
    if (!token) {
      setError("You must be logged in to add content.");
      return false;
    }

    try {
      // Format the token properly
      const formattedToken = formatToken(token);
      
      // Make a quick validation request
      await axios.get(`${BACKEND_URL}/content`, {
        headers: {
          Authorization: formattedToken,
        },
        withCredentials: true // Enable cookies for this request
      });
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        // Also clear the cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setTimeout(() => {
          navigate("/signin");
          onClose();
        }, 2000);
        return false;
      }
      return true; // Allow submission for other errors
    }
  };

  const handleFormSubmit = async (data: IProps) => {
    const isValid = await validateTokenBeforeSubmit();
    if (isValid) {
      onSubmit(data);
    }
  };

  return (
    <div>
      {open && (
        <div className="bg-black/60 w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-[9999]">
          <div className="flex flex-col justify-center">
            <span className="bg-emerald-50 p-6 rounded-lg z-[10000] opacity-100 relative min-w-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#124559]">Add New Content</h2>
                <div onClick={handleClose} className="cursor-pointer">
                  <X className="text-gray-700 hover:text-gray-900" />
                </div>
              </div>
             
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
             
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="title"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter content title"
                  />
                  {errors.title && (
                    <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>
                  )}
                </div>
             
                <div>
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="link"
                  >
                    Link
                  </label>
                  <input
                    type="url"
                    id="link"
                    {...register("link", { 
                      required: "Link is required",
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: "Please enter a valid URL starting with http:// or https://"
                      }
                    })}
                    className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                      errors.link ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.link && (
                    <span className="text-red-500 text-xs mt-1">{errors.link.message}</span>
                  )}
                </div>
             
                <div>
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="type"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    {...register("type", { required: "Type is required" })}
                    className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-black ${
                      errors.type ? "border-red-300" : "border-emerald-700"
                    }`}
                  >
                    <option className="text-black" value="">Select content type</option>
                    <option className="text-black" value="tweet">Tweet</option>
                    <option className="text-black" value="video">Video</option>
                    <option className="text-black" value="document">Document</option>
                    <option className="text-black" value="link">Link</option>
                    <option className="text-black" value="tag">Tag</option>
                  </select>
                  {errors.type && (
                    <span className="text-red-500 text-xs mt-1">{errors.type.message}</span>
                  )}
                </div>
             
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400 py-2 rounded-lg transition-colors duration-300 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#124559] text-[#EFF6E0] hover:bg-[#01161E] py-2 rounded-lg transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Adding..." : "Add Content"}
                  </Button>
                </div>
              </form>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
