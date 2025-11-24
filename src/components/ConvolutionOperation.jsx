import React, { useState, useEffect, useRef } from 'react';

export const ConvolutionOperation = ({ onClose }) => {
  const inputCanvasRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('edge-detection');
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [customKernel, setCustomKernel] = useState([
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ]);

  // Predefined filters/kernels
  const filters = {
    'edge-detection': {
      name: 'Edge Detection',
      kernel: [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1]
      ],
      description: 'Highlights edges and boundaries'
    },
    'sharpen': {
      name: 'Sharpen',
      kernel: [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ],
      description: 'Enhances fine details'
    },
    'blur': {
      name: 'Blur (Box)',
      kernel: [
        [1/9, 1/9, 1/9],
        [1/9, 1/9, 1/9],
        [1/9, 1/9, 1/9]
      ],
      description: 'Smooths the image'
    },
    'gaussian-blur': {
      name: 'Gaussian Blur',
      kernel: [
        [1/16, 2/16, 1/16],
        [2/16, 4/16, 2/16],
        [1/16, 2/16, 1/16]
      ],
      description: 'Weighted blur, smoother'
    },
    'emboss': {
      name: 'Emboss',
      kernel: [
        [-2, -1, 0],
        [-1, 1, 1],
        [0, 1, 2]
      ],
      description: 'Creates 3D relief effect'
    },
    'vertical-edge': {
      name: 'Vertical Edges',
      kernel: [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ],
      description: 'Sobel vertical edge detector'
    },
    'horizontal-edge': {
      name: 'Horizontal Edges',
      kernel: [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
      ],
      description: 'Sobel horizontal edge detector'
    },
    'identity': {
      name: 'Identity',
      kernel: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ],
      description: 'No change (passthrough)'
    }
  };

  const currentFilter = filters[selectedFilter];
  const kernel = currentFilter.kernel;

  // Create simple test image (checkerboard + shapes)
  const createTestImage = () => {
    const size = 32;
    const image = [];
    
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        // Checkerboard background
        let value = ((Math.floor(x / 4) + Math.floor(y / 4)) % 2) * 100 + 100;
        
        // Add circle
        const dx = x - size / 4;
        const dy = y - size / 4;
        if (dx * dx + dy * dy < 36) value = 255;
        
        // Add square
        if (x > size * 0.6 && x < size * 0.9 && y > size * 0.6 && y < size * 0.9) {
          value = 50;
        }
        
        // Add diagonal line
        if (Math.abs(x - y) < 2) value = 200;
        
        row.push(value);
      }
      image.push(row);
    }
    
    return image;
  };

  const [inputImage, setInputImage] = useState(createTestImage());

  // Perform convolution
  const convolve = (image, kernel, stride = 1, padding = 0) => {
    const inputHeight = image.length;
    const inputWidth = image[0].length;
    const kernelSize = kernel.length;
    const kernelRadius = Math.floor(kernelSize / 2);

    // Calculate output dimensions
    const outputHeight = Math.floor((inputHeight + 2 * padding - kernelSize) / stride) + 1;
    const outputWidth = Math.floor((inputWidth + 2 * padding - kernelSize) / stride) + 1;

    const output = [];

    for (let y = 0; y < outputHeight; y++) {
      const row = [];
      for (let x = 0; x < outputWidth; x++) {
        let sum = 0;

        // Apply kernel
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const inputY = y * stride + ky - padding;
            const inputX = x * stride + kx - padding;

            // Check bounds (with padding)
            if (inputY >= 0 && inputY < inputHeight && inputX >= 0 && inputX < inputWidth) {
              sum += image[inputY][inputX] * kernel[ky][kx];
            }
          }
        }

        // Clamp to 0-255 range
        row.push(Math.max(0, Math.min(255, sum)));
      }
      output.push(row);
    }

    return output;
  };

  const outputImage = convolve(inputImage, kernel, stride, padding);

  // Animation
  useEffect(() => {
    if (animating) {
      const maxSteps = (outputImage.length * outputImage[0].length);
      const interval = setInterval(() => {
        setAnimationStep(prev => {
          if (prev >= maxSteps - 1) {
            setAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [animating, outputImage]);

  // Draw input image
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellSize = 12;
    const width = inputImage[0].length * cellSize;
    const height = inputImage.length * cellSize;

    canvas.width = width;
    canvas.height = height;

    // Draw image
    for (let y = 0; y < inputImage.length; y++) {
      for (let x = 0; x < inputImage[0].length; x++) {
        const value = inputImage[y][x];
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw grid (light)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= inputImage[0].length; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();
    }
    for (let i = 0; i <= inputImage.length; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Highlight current convolution window if animating
    if (animating) {
      const outputWidth = outputImage[0].length;
      const currentX = animationStep % outputWidth;
      const currentY = Math.floor(animationStep / outputWidth);

      const startX = currentX * stride;
      const startY = currentY * stride;

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        startX * cellSize,
        startY * cellSize,
        kernel.length * cellSize,
        kernel.length * cellSize
      );

      // Draw kernel overlay
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.fillRect(
        startX * cellSize,
        startY * cellSize,
        kernel.length * cellSize,
        kernel.length * cellSize
      );
    }

  }, [inputImage, animating, animationStep, kernel, stride, outputImage]);

  // Draw output image
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellSize = 12;
    const width = outputImage[0].length * cellSize;
    const height = outputImage.length * cellSize;

    canvas.width = width;
    canvas.height = height;

    // Draw background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw output image (progressively if animating)
    const pixelsToDraw = animating ? animationStep + 1 : outputImage.length * outputImage[0].length;

    for (let i = 0; i < pixelsToDraw; i++) {
      const y = Math.floor(i / outputImage[0].length);
      const x = i % outputImage[0].length;

      if (y < outputImage.length) {
        const value = outputImage[y][x];
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= outputImage[0].length; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();
    }
    for (let i = 0; i <= outputImage.length; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Highlight current pixel if animating
    if (animating && animationStep < outputImage.length * outputImage[0].length) {
      const currentX = animationStep % outputImage[0].length;
      const currentY = Math.floor(animationStep / outputImage[0].length);

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        currentX * cellSize,
        currentY * cellSize,
        cellSize,
        cellSize
      );
    }

  }, [outputImage, animating, animationStep]);

  const handleAnimate = () => {
    setAnimationStep(0);
    setAnimating(true);
  };

  const handleReset = () => {
    setAnimating(false);
    setAnimationStep(0);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Visualization Area */}
      <div className="flex-1 space-y-4">
        {/* Input and Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Image */}
          <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Input Image (32×32)</h3>
            <div className="flex justify-center">
              <canvas
                ref={inputCanvasRef}
                className="border border-white/20 rounded"
              />
            </div>
          </div>

          {/* Output Image */}
          <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Output Feature Map ({outputImage[0].length}×{outputImage.length})
            </h3>
            <div className="flex justify-center">
              <canvas
                ref={outputCanvasRef}
                className="border border-white/20 rounded"
              />
            </div>
          </div>
        </div>

        {/* Kernel Visualization */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Convolution Kernel (3×3)</h3>
          <div className="flex flex-col items-center gap-3">
            <div className="grid grid-cols-3 gap-1">
              {kernel.map((row, i) =>
                row.map((value, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-bold ${
                      value > 0
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : value < 0
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-slate-700/50 border-slate-600 text-gray-400'
                    }`}
                  >
                    {value.toFixed(2)}
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-400 text-center max-w-md">
              {currentFilter.description}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Filter Selection */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Select Filter</h3>
          <div className="space-y-2">
            {Object.entries(filters).map(([key, filter]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedFilter(key);
                  handleReset();
                }}
                className={`w-full p-2 rounded-lg border text-left text-xs transition-all ${
                  selectedFilter === key
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold">{filter.name}</div>
                <div className="text-gray-500">{filter.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Hyperparameters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>Stride</span>
                <span className="text-cyan-400 font-mono">{stride}</span>
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={stride}
                onChange={(e) => {
                  setStride(Number(e.target.value));
                  handleReset();
                }}
                className="w-full accent-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-1">How many pixels to skip</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>Padding</span>
                <span className="text-purple-400 font-mono">{padding}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                value={padding}
                onChange={(e) => {
                  setPadding(Number(e.target.value));
                  handleReset();
                }}
                className="w-full accent-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Border pixels added</p>
            </div>
          </div>
        </div>

        {/* Animation Control */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4 space-y-2">
          <button
            onClick={handleAnimate}
            disabled={animating}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {animating ? '⏳ Computing...' : '🎬 Animate Convolution'}
          </button>
          <button
            onClick={handleReset}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all text-sm"
          >
            Reset
          </button>
        </div>

        {/* Output Dimensions */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Dimensions</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Input:</span>
              <span className="font-mono text-white">{inputImage[0].length} × {inputImage.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kernel:</span>
              <span className="font-mono text-cyan-400">3 × 3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stride:</span>
              <span className="font-mono text-cyan-400">{stride}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Padding:</span>
              <span className="font-mono text-purple-400">{padding}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="text-gray-400">Output:</span>
              <span className="font-mono text-emerald-400">{outputImage[0].length} × {outputImage.length}</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-white/5 rounded text-xs text-gray-400">
            <span className="font-mono text-cyan-400">
              {outputImage.length} = ⌊({inputImage.length} + 2×{padding} - 3) / {stride}⌋ + 1
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-cyan-500/10 rounded-xl border border-cyan-500/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className="text-xs font-bold text-cyan-400">
              How CNNs See
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Convolution slides a filter across the image, computing a weighted sum at each position. Early layers detect edges. Deeper layers combine these into complex patterns (faces, objects). This is how CNNs understand images!
          </p>
        </div>
      </div>
    </div>
  );
};