import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface NavBarComponent {
  onAddContentClick: () => void,
  onShareContentClick: (id: string) => void,
  currentContentId?: string
}

export default function Navbar({ onAddContentClick, onShareContentClick, currentContentId }: NavBarComponent) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between w-full px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-[#01161E]">📄 All Notes</span>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("/search")}
          className="text-[#124559] border-[#124559] hover:bg-[#124559] hover:text-[#EFF6E0] transition-colors"
        >
          <span className="mr-2">🔍</span> AI Search
        </Button>
        <Button
          variant="reverse"
          onClick={() => currentContentId && onShareContentClick(currentContentId)}
          className="text-[#124559] border-[#124559] hover:bg-[#124559] hover:text-[#EFF6E0] rounded-md transition-colors"
        >
          <span className="mr-2">🔗</span> Share Brain
        </Button>
        <Button
          onClick={onAddContentClick}
          className="bg-[#124559] text-[#EFF6E0] hover:bg-[#01161E] rounded-md transition-colors"
        >
          <span className="mr-2">+</span> Add Content
        </Button>
      </div>
    </div>
  );
}
