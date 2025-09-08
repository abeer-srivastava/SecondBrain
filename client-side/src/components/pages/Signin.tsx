import { Brain } from "lucide-react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {BrainSideContent} from "../sideComponent"
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BACKEND_URL } from "@/config";

interface IFormInput {
  username: string;
  password: string;
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

// Test token immediately after receiving it
const testTokenImmediately = async (token: string) => {
  try {
    const formattedToken = formatToken(token);
    console.log("Testing token immediately:", formattedToken);
    
    const response = await axios.get(`${BACKEND_URL}/content`, {
      headers: {
        Authorization: formattedToken,
      },
      withCredentials: true // Enable cookies for this request
    });
    
    console.log("Token test successful:", response.status);
    return true;
  } catch (err) {
    console.error("Token test failed:", err);
    return false;
  }
};

// Check current stored tokens


export default function Signin() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();
  

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setError("");
    setIsLoading(true);
    
    try {
      
      // Log the exact request we're about to send
      const requestData = {
        username: data.username,
        password: data.password
      };
      
      const response = await axios.post(`${BACKEND_URL}/signin`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true // Enable cookies for this request
      });
 
      // Try to get token from cookies
      let jwt = getCookie('token');
      if (!jwt) {
        jwt = response.data.token;
      }
      
      // If still no token, check response headers
      if (!jwt && response.headers['Authorization']) {
        jwt = response.headers['Authorization'].replace('Bearer ', '');
      }      
      if (!jwt) {
        setError("No token received from server. Backend may need to be configured to send token in response body or non-HttpOnly cookie.");
        setIsLoading(false);
        return;
      }
      
      // Format the token properly
      const formattedToken = formatToken(jwt);

      const tokenWorks = await testTokenImmediately(jwt);
      
      if (!tokenWorks) {
        setError("Token received but validation failed. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Store the token in localStorage
      localStorage.setItem("token", formattedToken);
      
      
      // Also set the token as a cookie for backup (non-HttpOnly)
      document.cookie = `token=${formattedToken}; path=/; max-age=86400; SameSite=Lax`;

      
      // Verify token was stored
      const storedToken = localStorage.getItem("token");
      console.log("Stored token verification:", storedToken);
      console.log("Stored token matches:", storedToken === formattedToken);
      
      console.log("=== SIGNIN PROCESS COMPLETE ===");
      
      // Add a small delay to ensure localStorage is updated
      setTimeout(() => {
        navigate("/page");
      }, 100);
      
    } catch (err) {
      console.error("=== SIGNIN ERROR ===");
      console.error("Signin error:", err);
      setIsLoading(false);
      
      if (axios.isAxiosError(err)) {
        console.log("=== DETAILED ERROR ANALYSIS ===");
        console.log("Error response:", err.response);
        console.log("Error status:", err.response?.status);
        console.log("Error status text:", err.response?.statusText);
        console.log("Error data:", err.response?.data);
        console.log("Error headers:", err.response?.headers);
        console.log("Request config:", err.config);
        console.log("Request URL:", err.config?.url);
        console.log("Request method:", err.config?.method);
        console.log("Request data:", err.config?.data);
        console.log("Request headers:", err.config?.headers);
        console.log("=== END ERROR ANALYSIS ===");
        
        // Server responded with error status
        if (err.response?.status === 401) {
          setError("Invalid username or password. Please try again.");
        } else if (err.response?.status === 404) {
          setError("User not found. Please check your username.");
        } else if (err.response?.status === 400) {
          setError("Please provide both username and password.");
        } else if (err.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Unknown error';
          setError(`Authentication failed: ${errorMessage}`);
        }
      } else if (err instanceof Error) {
        console.log("Non-Axios error:", err.message);
        setError("An unexpected error occurred. Please try again.");
      } else {
        console.log("Unknown error type:", err);
        setError("Network error. Please check your connection and try again.");
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0] p-4">
      <div className="flex items-center justify-center md:pr-12 md:border-r-2 md:border-[#124559] md:h-auto md:py-8 mb-8 md:mb-0">
        <BrainSideContent />
      </div>

      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-8 transform transition-all duration-300 hover:scale-[1.01] md:ml-12">
        <h2 className="text-[#124559] text-3xl font-extrabold text-center mb-6">
          <Brain className="w-8 h-8 inline-block mr-2 align-middle" /> Sign In
        </h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
        

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username Input Group */}
          <div>
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Username is required" })}
              className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                errors.username ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="john.doe"
            />
            {errors.username && (
              <span className="text-red-500 text-xs mt-1">{errors.username.message}</span>
            )}
          </div>

          {/* Password Input Group */}
          <div>
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
            )}
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#124559] text-[#EFF6E0] py-3 rounded-lg hover:bg-[#01161E] transition-colors duration-300 text-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="mr-2">⏳</span> Signing In...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span> Sign In
              </>
            )}
          </Button>
            <div>
              <span>
                 Wanted To Create an Account <Button className="text-green-800 border-0 text-md pl-0" onClick={()=>{
                  navigate("/signup");
                 }}>Signup</Button>
              </span>
            </div>
        </form>
      </div>
    </div>
  );
}
