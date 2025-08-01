import { Brain } from "lucide-react";

export const BrainSideContent = () => {
  return (
    <div className="flex flex-col items-center md:items-start md:mr-12 mb-8 md:mb-0 text-center md:text-left">
      {/* Brain Icon */}
      <Brain className="w-24 h-24 text-[#124559] mb-4 md:mb-6" />
      {/* Second Brain Heading */}
      <h2 className="text-[#124559] text-5xl font-extrabold leading-tight">
        Second Brain
      </h2>
      <p className="text-gray-600 mt-2 max-w-xs">
        Organize your thoughts, connect ideas, and unlock your potential.
      </p>
    </div>
  );
};