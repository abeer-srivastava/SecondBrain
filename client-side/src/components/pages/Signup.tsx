import { useState } from "react";
import {  Brain } from "lucide-react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button"; // Assuming this path is correct for your Button component
import {BrainSideContent} from "../sideComponent" // Assuming this path is correct for BrainSideContent
import axios from "axios"
import {BACKEND_URL} from "../../config.ts"
import { useNavigate } from "react-router-dom";
interface IFormInput {
  username: string;
  password: string;
}

export default function Signup() {
  const { register, handleSubmit } = useForm<IFormInput>();
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      setError(""); // Clear any previous errors
      console.log(data);
      
      await axios.post(`${BACKEND_URL}/signup`, {
        username: data.username,
        password: data.password
      });
      console.log("User Signed Up");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during signup");
    }
  };

  return (
    
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0] p-4">

    
      <div className="flex items-center justify-center md:pr-12 md:border-r-2 md:border-[#124559] md:h-auto md:py-8 mb-8 md:mb-0">
            <BrainSideContent />
      </div>

     
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-8 transform transition-all duration-300 hover:scale-[1.01] md:ml-12">
        <h2 className="text-[#124559] text-3xl font-extrabold text-center mb-6">
          <Brain className="w-8 h-8 inline-block mr-2 align-middle" /> Sign Up
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
              {...register("username", { required: true })}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="john.doe"
            />
            {/* You can add error handling here, e.g., errors.username && <span className="text-red-500 text-xs mt-1">Username is required</span> */}
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
              {...register("password", { required: true, minLength: 6 })}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="••••••••"
            />
            {/* You can add error handling here, e.g., errors.password && <span className="text-red-500 text-xs mt-1">Password must be at least 6 characters</span> */}
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            className="w-full bg-[#124559] text-[#EFF6E0] py-3 rounded-lg hover:bg-[#01161E] transition-colors duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
          >
            <span className="mr-2">🚀</span> Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
}
