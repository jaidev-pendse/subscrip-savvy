import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedBlob: Blob) => void;
  imageSrc: string;
}

export const ImageCropper = ({ isOpen, onClose, onCrop, imageSrc }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState([1]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const CANVAS_SIZE = 300;
  const CROP_SIZE = 250;

  const loadImage = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      
      // Calculate initial scale to fit the image in the crop area
      const minScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
      setScale([minScale]);
      setPosition({ x: 0, y: 0 });
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      loadImage();
    }
  }, [isOpen, loadImage]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img || !imageLoaded) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Save context
    ctx.save();

    // Draw background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Calculate image dimensions and position
    const scaledWidth = img.width * scale[0];
    const scaledHeight = img.height * scale[0];
    
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    
    const imageX = centerX - scaledWidth / 2 + position.x;
    const imageY = centerY - scaledHeight / 2 + position.y;

    // Draw image
    ctx.drawImage(img, imageX, imageY, scaledWidth, scaledHeight);

    // Create circular clipping mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(centerX, centerY, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw overlay (areas outside the circle)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Cut out the circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Restore context
    ctx.restore();

    // Draw circle border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, position, imageLoaded]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Create a new canvas for the cropped result
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = CROP_SIZE;
    cropCanvas.height = CROP_SIZE;
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) return;

    // Calculate image position and scale
    const scaledWidth = img.width * scale[0];
    const scaledHeight = img.height * scale[0];
    
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    
    const imageX = centerX - scaledWidth / 2 + position.x;
    const imageY = centerY - scaledHeight / 2 + position.y;

    // Calculate source rectangle (what part of the original image to crop)
    const cropStartX = (centerX - CROP_SIZE / 2 - imageX) / scale[0];
    const cropStartY = (centerY - CROP_SIZE / 2 - imageY) / scale[0];
    const cropWidth = CROP_SIZE / scale[0];
    const cropHeight = CROP_SIZE / scale[0];

    // Draw the cropped image
    cropCtx.drawImage(
      img,
      Math.max(0, cropStartX),
      Math.max(0, cropStartY),
      Math.min(img.width - Math.max(0, cropStartX), cropWidth),
      Math.min(img.height - Math.max(0, cropStartY), cropHeight),
      Math.max(0, -cropStartX * scale[0]),
      Math.max(0, -cropStartY * scale[0]),
      Math.min(CROP_SIZE, (img.width - Math.max(0, cropStartX)) * scale[0]),
      Math.min(CROP_SIZE, (img.height - Math.max(0, cropStartY)) * scale[0])
    );

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="border border-gray-200 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          
          <div className="w-full space-y-2">
            <Label htmlFor="zoom-slider">Zoom</Label>
            <Slider
              id="zoom-slider"
              min={0.5}
              max={3}
              step={0.1}
              value={scale}
              onValueChange={setScale}
              className="w-full"
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Drag to reposition • Use slider to zoom
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCrop}
            className="bg-gradient-primary hover:opacity-90"
          >
            Crop Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};