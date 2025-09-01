import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Search, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import { IntelligentSearch } from "../IntelligentSearch";

export default function SearchPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"search" | "features" | "examples">("search");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0]">
      {/* Header */}
      <div className="bg-[#EFF6E0] border-b border-[#AEC3B0] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/page")}
              className="text-[#124559] hover:bg-[#AEC3B0]"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-[#124559]">
              🔍 Intelligent Search & AI Analysis
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#AEC3B0] mb-8">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "search"
                ? "text-[#124559] border-b-2 border-[#124559]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Search size={16} />
            Search & References
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "features"
                ? "text-[#124559] border-b-2 border-[#124559]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles size={16} />
            AI Features
          </button>
          <button
            onClick={() => setActiveTab("examples")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "examples"
                ? "text-[#124559] border-b-2 border-[#124559]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen size={16} />
            Examples & Tips
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#124559] mb-4">
                Search Your Knowledge Base
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Use natural language to find content, get AI-powered references, and discover connections between your knowledge.
              </p>
            </div>
            
            <IntelligentSearch 
              onContentSelect={(contentId) => {
                console.log("Selected content:", contentId);
                // Navigate to content or show details
              }} 
            />
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#124559] mb-4">
                AI-Powered Features
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover how Gemini AI enhances your knowledge management experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Semantic Search */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="text-[#124559]" size={24} />
                  <h3 className="text-lg font-semibold text-[#124559]">Semantic Search</h3>
                </div>
                <p className="text-gray-600">
                  Find content using natural language queries. The AI understands context and meaning, not just keywords.
                </p>
              </div>

              {/* Intelligent References */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="text-[#124559]" size={24} />
                  <h3 className="text-lg font-semibold text-[#124559]">Smart References</h3>
                </div>
                <p className="text-gray-600">
                  Get AI-generated references and related content suggestions based on semantic similarity.
                </p>
              </div>

              {/* Content Analysis */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="text-[#124559]" size={24} />
                  <h3 className="text-lg font-semibold text-[#124559]">Content Insights</h3>
                </div>
                <p className="text-gray-600">
                  Automatic content analysis with summaries, keywords, and insights generated by Gemini AI.
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="text-[#124559]" size={24} />
                  <h3 className="text-lg font-semibold text-[#124559]">Smart Recommendations</h3>
                </div>
                <p className="text-gray-600">
                  Discover related content and get personalized recommendations based on your interests.
                </p>
              </div>

              {/* Context Understanding */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="text-[#124559]" size={24} />
                  <h3 className="text-lg font-semibold text-[#124559]">Context Awareness</h3>
                </div>
                <p className="text-gray-600">
                  The AI understands the context of your queries and provides relevant, contextual results.
                </p>
              </div>

              {/* Natural Language */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="text-[#124559]" size={24} />
                  <h3 className="text-lg font-semibold text-[#124559]">Natural Language</h3>
                </div>
                <p className="text-gray-600">
                  Ask questions in plain English and get intelligent, relevant answers from your knowledge base.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === "examples" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#124559] mb-4">
                Search Examples & Tips
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Learn how to get the most out of your intelligent search capabilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Search Examples */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <h3 className="text-xl font-semibold text-[#124559] mb-4">💡 Search Examples</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-800">Find React tutorials:</p>
                    <p className="text-gray-600 text-sm">"Show me React tutorials and guides"</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Find content about state management:</p>
                    <p className="text-gray-600 text-sm">"Content related to managing application state"</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Find recent articles:</p>
                    <p className="text-gray-600 text-sm">"Show me recent articles about web development"</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Find related concepts:</p>
                    <p className="text-gray-600 text-sm">"What's related to machine learning and AI?"</p>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#AEC3B0]">
                <h3 className="text-xl font-semibold text-[#124559] mb-4">🚀 Pro Tips</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-800">Use natural language:</p>
                    <p className="text-gray-600 text-sm">Write queries as you would ask a person</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Be specific:</p>
                    <p className="text-gray-600 text-sm">Include context and details for better results</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Try different phrasings:</p>
                    <p className="text-gray-600 text-sm">If one query doesn't work, rephrase it</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Use the References feature:</p>
                    <p className="text-gray-600 text-sm">Get AI-powered content connections</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-[#124559] to-[#01161E] p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">🎯 Getting Started</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">1. Start Simple</h4>
                  <p className="text-gray-200 text-sm">
                    Begin with basic searches like "React tutorials" or "JavaScript basics"
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Explore References</h4>
                  <p className="text-gray-200 text-sm">
                    Use the "Get References" button to discover related content
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Refine Queries</h4>
                  <p className="text-gray-200 text-sm">
                    Add more context to get more specific and relevant results
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 