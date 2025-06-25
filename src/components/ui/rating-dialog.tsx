
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleSubmit = async () => {
    if (!user?.id || selectedRating === 0) return;
    
    const success = await submitRating(selectedRating, user.id);
    if (success) {
      toast.success("Thank you for your rating!");
      onClose();
      setSelectedRating(0);
      setHoveredRating(0);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedRating(0);
    setHoveredRating(0);
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
        
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="flex space-x-1">
            {renderStars()}
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
