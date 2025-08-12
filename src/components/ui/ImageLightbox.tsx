
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  startIndex?: number;
  altPrefix?: string;
  title?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  open,
  onOpenChange,
  images,
  startIndex = 0,
  altPrefix = "Gallery image",
  title,
}) => {
  const [index, setIndex] = React.useState(startIndex);

  React.useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-2 sm:p-4">
        <div className="flex items-center justify-between px-2 sm:px-4 pb-2">
          <h3 className="text-base sm:text-lg font-semibold truncate">
            {title || "Gallery"}
          </h3>
          <div className="text-sm text-muted-foreground">
            {index + 1} / {images.length}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close image viewer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          {/* Floating close button for better mobile usability */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close image viewer"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 rounded-full bg-background/80 border border-border hover:bg-background/90"
          >
            <X className="h-4 w-4" />
          </Button>
          <Carousel
            opts={{ startIndex: index, loop: true, dragFree: false }}
            setApi={(api) => {
              if (!api) return;
              api.on("select", () => setIndex(api.selectedScrollSnap()));
            }}
            className="w-full"
          >
            <CarouselContent>
              {images.map((src, i) => (
                <CarouselItem key={`${src}-${i}`} className="flex items-center justify-center">
                  <div className="w-full aspect-[4/3] sm:aspect-video md:aspect-[3/2] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={src}
                      alt={`${altPrefix} ${i + 1}`}
                      className="max-h-[70vh] w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 sm:left-4" />
                <CarouselNext className="right-2 sm:right-4" />
              </>
            )}
          </Carousel>
        </div>
        <div className="flex justify-center pt-2 sm:pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
