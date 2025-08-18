
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRatings } from "@/hooks/useRatings";
import { toast } from "sonner";

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  specialistId: string;
  specialistName: string;
  serviceName: string;
}

export const RatingDialog = ({ 
  isOpen, 
  onClose, 
  specialistId, 
  specialistName, 
  serviceName 
}: RatingDialogProps) => {
  const { user } = useAuth();
  const { submitRating, loading } = useRatings(specialistId);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!user?.id || selectedRating === 0) return;
    
    const success = await submitRating(selectedRating, user.id, comment.trim() || undefined);
    if (success) {
      toast.success("Thank you for your rating and feedback!");
      onClose();
      setSelectedRating(0);
      setHoveredRating(0);
      setComment("");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedRating(0);
    setHoveredRating(0);
    setComment("");
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const starValue = index + 1;
      const isFilled = (hoveredRating || selectedRating) >= starValue;
      
      return (
        <Star
          key={index}
          className={`h-8 w-8 cursor-pointer transition-colors ${
            isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => setSelectedRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Rate Your Experience</DialogTitle>
          <DialogDescription className="text-center">
            How was your {serviceName} service with {specialistName}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 py-4">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {renderStars()}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Share your feedback (optional)</label>
            <Textarea
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            {comment.length > 0 && (
              <div className="text-xs text-muted-foreground text-right">
                {comment.length}/500 characters
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedRating === 0}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
