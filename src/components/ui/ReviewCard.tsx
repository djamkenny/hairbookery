
import React from "react";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  name: string;
  date: string;
  rating: number;
  comment: string;
  image?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ReviewCard = ({ 
  name, 
  date, 
  rating, 
  comment, 
  image,
  className,
  style
}: ReviewCardProps) => {
  return (
    <div 
      className={cn(
        "bg-card p-6 rounded-lg border border-border/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border",
        className
      )}
      style={style}
    >
      <div className="flex items-start gap-4">
        {image && (
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden">
              <img 
                src={image} 
                alt={`${name}'s review`} 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{name}</h4>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <StarIcon 
                key={i} 
                className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          
          <p className="text-muted-foreground text-sm">{comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
