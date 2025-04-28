import React, { useState, useRef, useEffect } from 'react';
import { Ruler, ZoomIn, ZoomOut, RefreshCw, Settings } from 'lucide-react';
import { ProcessedResult, ThresholdConfig } from '../types';
import { processImage } from '../utils/imageProcessing';
import CanvasAnnotation from './CanvasAnnotation';
import ThresholdControls from './ThresholdControls';

const ImageProcessor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [config, setConfig] = useState<ThresholdConfig>({
    binarizationThreshold: 150,
    minObjectSize: 10000,
    maxGapWidth: 300,
    dpi: 300 // Standard photo/scanner resolution
  });
  
  const canvasWidth = 800;
  const canvasHeight = 600;
  const processingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    setLoading(true);
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setLoading(false);
        processImageData(img);
      };
      
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const processImageData = (img: HTMLImageElement) => {
    if (!processingCanvasRef.current) {
      processingCanvasRef.current = document.createElement('canvas');
    }
    
    const canvas = processingCanvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0);
    
    // Process image
    const result = processImage(canvas, config);
    setProcessedResult(result);
  };
  
  const handleReprocess = () => {
    if (originalImage) {
      processImageData(originalImage);
    }
  };
  
  const handleZoom = (factor: number) => {
    setScale((prevScale) => {
      const newScale = prevScale * factor;
      return Math.max(0.1, Math.min(5, newScale));
    });
  };
  
  useEffect(() => {
    if (originalImage) {
      processImageData(originalImage);
    }
  }, [config]);
  
  return (
    <div className="flex flex-col items-center p-4 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Ruler className="mr-2" /> Component Gap Detector
        </h2>
        <div className="flex items-center">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 bg-gray-200 rounded-l-lg hover:bg-gray-300"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 bg-gray-200 rounded-r-lg hover:bg-gray-300"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleReprocess}
            className="ml-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            title="Reprocess"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className="ml-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
      
      {showControls && (
        <ThresholdControls 
          config={config} 
          setConfig={setConfig} 
        />
      )}
      
      <div className="w-full bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col items-center">
          <label 
            htmlFor="image-upload" 
            className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50"
          >
            <span className="text-sm text-gray-500">
              {originalImage ? 'Change image' : 'Upload an image of components to detect gaps'}
            </span>
            <input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {originalImage && !loading && (
        <div className="w-full">
          <CanvasAnnotation
            originalImage={originalImage}
            processedResult={processedResult}
            width={canvasWidth}
            height={canvasHeight}
            scale={scale}
          />
          
          {processedResult && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Measurement Results</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Number of Objects Detected</p>
                  <p className="text-xl font-bold">{processedResult.objects.length}</p>
                </div>
                
                {processedResult.gapWidthMm !== null && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Gap Width</p>
                    <p className="text-xl font-bold">{processedResult.gapWidthMm.toFixed(2)} mm</p>
                    <p className="text-xs text-gray-500">({processedResult.gapWidth} pixels)</p>
                  </div>
                )}
                
                {processedResult.gapHeightMm !== null && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Gap Height</p>
                    <p className="text-xl font-bold">{processedResult.gapHeightMm.toFixed(2)} mm</p>
                    <p className="text-xs text-gray-500">({processedResult.gapHeight} pixels)</p>
                  </div>
                )}
                
                {processedResult.gap && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Gap Area</p>
                    <p className="text-xl font-bold">
                      {((processedResult.gapWidthMm || 0) * (processedResult.gapHeightMm || 0)).toFixed(2)} sq. mm
                    </p>
                  </div>
                )}
              </div>
              
              {processedResult.objects.length === 2 && processedResult.gap && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">
                    Found gap between components: 
                    <span className="font-bold"> {processedResult.gapWidthMm?.toFixed(2)} × {processedResult.gapHeightMm?.toFixed(2)} mm</span>
                  </p>
                </div>
              )}
              
              {processedResult.objects.length !== 2 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-sm font-medium text-yellow-800">
                    Expected 2 components, but found {processedResult.objects.length}. 
                    Try adjusting the threshold settings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;