import React, { useState, useEffect, useRef } from 'react';

const MatrixTransform = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  // Letter F shape coordinates (relative to center)
  const letterF = [
    // Vertical line
    { x: -40, y: -60 }, { x: -40, y: 60 },
    // Top horizontal
    { x: -40, y: -60 }, { x: 20, y: -60 },
    // Middle horizontal
    { x: -40, y: 0 }, { x: 10, y: 0 }
  ];

  // Create transformation matrix
  const getTransformMatrix = () => {
    const theta = (rotation * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    
    // Combined rotation and scale matrix
    return [
      [scale * cos, -scale * sin],
      [scale * sin, scale * cos]
    ];
  };

  // Apply matrix to a point
  const transformPoint = (point, matrix) => {
    return {
      x: matrix[0][0] * point.x + matrix[0][1] * point.y,
      y: matrix[1][0] * point.x + matrix[1][1] * point.y
    };
  };

  // Calculate determinant
  const getDeterminant = (matrix) => {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  };

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes (original)
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Get transformation matrix
    const matrix = getTransformMatrix();

    // Draw original F (faint)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < letterF.length; i += 2) {
      ctx.beginPath();
      ctx.moveTo(centerX + letterF[i].x, centerY + letterF[i].y);
      ctx.lineTo(centerX + letterF[i + 1].x, centerY + letterF[i + 1].y);
      ctx.stroke();
    }

    // Draw transformed F (bold)
    const transformedF = letterF.map(p => transformPoint(p, matrix));
    
    ctx.strokeStyle = 'rgba(168, 85, 247, 1)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
    
    for (let i = 0; i < transformedF.length; i += 2) {
      ctx.beginPath();
      ctx.moveTo(centerX + transformedF[i].x, centerY + transformedF[i].y);
      ctx.lineTo(centerX + transformedF[i + 1].x, centerY + transformedF[i + 1].y);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;

  }, [rotation, scale]);

  const handleReset = () => {
    setRotation(0);
    setScale(1);
  };

  const matrix = getTransformMatrix();
  const determinant = getDeterminant(matrix);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-slate-900 rounded-3xl border border-white/20 max-w-4xl w-full p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Matrix Transformations
            </h2>
            <p className="text-gray-400">See how matrices transform space</p>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-4">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full rounded-lg"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Rotation Control */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Scale Control */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Scale: {scale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              Reset
            </button>

            {/* Matrix Display */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Transformation Matrix
              </h3>
              <div className="font-mono text-sm text-white space-y-1">
                <div>
                  [{matrix[0][0].toFixed(2)}, {matrix[0][1].toFixed(2)}]
                </div>
                <div>
                  [{matrix[1][0].toFixed(2)}, {matrix[1][1].toFixed(2)}]
                </div>
              </div>
            </div>

            {/* Determinant */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Determinant
              </h3>
              <div className="text-2xl font-bold text-cyan-400">
                {determinant.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Area scaling factor
              </p>
            </div>

            {/* Legend */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Legend
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-cyan-500/30 rounded"></div>
                  <span className="text-gray-400">Original</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-purple-500 rounded shadow-glow"></div>
                  <span className="text-gray-400">Transformed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <p className="text-sm text-cyan-300">
            💡 <strong>Tip:</strong> Drag the sliders to see how the letter F transforms. 
            The faint cyan F shows the original, and the bright purple F shows the result.
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        .shadow-glow {
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default MatrixTransform;