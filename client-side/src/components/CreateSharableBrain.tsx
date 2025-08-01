import { useState } from 'react';
import { useShare } from '../hooks/use-share';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CreateSharableBrainProps {
  open: boolean;
  onClose: () => void;
}

const CreateSharableBrain = ({ open, onClose }: CreateSharableBrainProps) => {
  const { shareContent, isSharing, error, clearError } = useShare();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleShare = async () => {
    clearError();
    setShareUrl(null);
    setIsSuccess(false);
    
    // Share the entire brain (using 'all' as contentId to indicate full brain sharing)
    const url = await shareContent('all');
    if (url) {
      setShareUrl(url);
      setIsSuccess(true);
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {
        console.warn('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setIsSuccess(false);
    clearError();
    onClose();
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        // You could add a toast notification here
      } catch (err) {
        console.warn('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[500px] bg-[#EFF6E0] border-[#AEC3B0]">
        <SheetHeader>
          <SheetTitle className="text-[#01161E] text-xl font-semibold">
            🔗 Share Your Brain
          </SheetTitle>
          <SheetDescription className="text-[#598392]">
            Create a shareable link to your Second Brain that others can view.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {isSuccess && shareUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <p className="text-green-700 font-medium">✅ Share link created successfully!</p>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Shareable Link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 text-sm bg-gray-50 border rounded px-2 py-1 text-gray-700"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className="bg-[#124559] text-[#EFF6E0] hover:bg-[#01161E]"
                  >
                    📋 Copy
                  </Button>
                </div>
              </div>
              <p className="text-sm text-green-600">
                Link has been copied to your clipboard! Share it with others to let them view your Second Brain.
              </p>
            </div>
          )}
          
          {!isSuccess && (
            <div className="text-center py-4">
              <p className="text-[#598392] mb-4">
                This will create a public link that allows others to view all your saved content.
              </p>
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="bg-[#124559] text-[#EFF6E0] hover:bg-[#01161E] px-6 py-2"
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Link...
                  </>
                ) : (
                  <>
                    🔗 Create Share Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t border-[#AEC3B0]">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-[#124559] text-[#124559] hover:bg-[#124559] hover:text-[#EFF6E0]"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateSharableBrain;