import React from 'react';
import { ThresholdConfig } from '../types';

interface ThresholdControlsProps {
  config: ThresholdConfig;
  setConfig: React.Dispatch<React.SetStateAction<ThresholdConfig>>;
}

const ThresholdControls: React.FC<ThresholdControlsProps> = ({ 
  config, 
  setConfig 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };
  
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-3">Processing Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Binarization Threshold: {config.binarizationThreshold}
          </label>
          <div className="flex items-center">
            <span className="text-xs mr-2">0</span>
            <input
              type="range"
              name="binarizationThreshold"
              min="0"
              max="255"
              value={config.binarizationThreshold}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs ml-2">255</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Determines how dark pixels must be to be considered part of an object
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Object Size: {config.minObjectSize}
          </label>
          <div className="flex items-center">
            <span className="text-xs mr-2">100</span>
            <input
              type="range"
              name="minObjectSize"
              min="100"
              max="10000"
              step="100"
              value={config.minObjectSize}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs ml-2">10000</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum pixel area to consider as a component (filters out noise)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Gap Width: {config.maxGapWidth}
          </label>
          <div className="flex items-center">
            <span className="text-xs mr-2">10</span>
            <input
              type="range"
              name="maxGapWidth"
              min="10"
              max="500"
              step="10"
              value={config.maxGapWidth}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs ml-2">500</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum width to consider as a gap between components
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image DPI: {config.dpi}
          </label>
          <div className="flex items-center">
            <span className="text-xs mr-2">72</span>
            <input
              type="range"
              name="dpi"
              min="72"
              max="1200"
              step="1"
              value={config.dpi}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs ml-2">1200</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dots per inch of the image (needed for mm conversion)
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Adjust these settings to improve detection accuracy based on your image.</p>
        <p className="mt-1">For accurate millimeter measurements, set the DPI to match your image's resolution.</p>
      </div>
    </div>
  );
};

export default ThresholdControls;