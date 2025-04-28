import React, { useRef, useEffect } from 'react';
import { Rect, ProcessedResult } from '../types';

interface CanvasAnnotationProps {
  originalImage: HTMLImageElement | null;
  processedResult: ProcessedResult | null;
  width: number;
  height: number;
  scale: number;
}

const CanvasAnnotation: React.FC<CanvasAnnotationProps> = ({
  originalImage,
  processedResult,
  width,
  height,
  scale
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw original image scaled
    const scaledWidth = originalImage.width * scale;
    const scaledHeight = originalImage.height * scale;
    ctx.drawImage(
      originalImage, 
      (canvas.width - scaledWidth) / 2, 
      (canvas.height - scaledHeight) / 2, 
      scaledWidth, 
      scaledHeight
    );
    
    if (processedResult) {
      // Draw object annotations
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'cyan';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      
      processedResult.objects.forEach((rect, index) => {
        const scaledRect = {
          x: (canvas.width - scaledWidth) / 2 + rect.x * scale,
          y: (canvas.height - scaledHeight) / 2 + rect.y * scale,
          width: rect.width * scale,
          height: rect.height * scale
        };
        
        ctx.strokeRect(scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height);
        ctx.fillRect(scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height);
        
        // Add object label
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Object ${index + 1}`, scaledRect.x, scaledRect.y - 5);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      });
      
      // Draw gap annotation if exists
      if (processedResult.gap) {
        ctx.strokeStyle = 'magenta';
        ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
        
        const scaledGap = {
          x: (canvas.width - scaledWidth) / 2 + processedResult.gap.x * scale,
          y: (canvas.height - scaledHeight) / 2 + processedResult.gap.y * scale,
          width: processedResult.gap.width * scale,
          height: processedResult.gap.height * scale
        };
        
        ctx.strokeRect(
          scaledGap.x, 
          scaledGap.y, 
          scaledGap.width, 
          scaledGap.height
        );
        ctx.fillRect(
          scaledGap.x, 
          scaledGap.y, 
          scaledGap.width, 
          scaledGap.height
        );
        
        // Add gap label with measurements
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(
          `Gap: ${processedResult.gapWidth}px × ${processedResult.gapHeight}px`, 
          scaledGap.x, 
          scaledGap.y - 5
        );
      }
    }
  }, [originalImage, processedResult, width, height, scale]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="rounded-lg shadow-md"
    />
  );
};

export default CanvasAnnotation;