import React, { useState, useEffect, useRef } from 'react';

export const MatrixTransform = ({ onClose }) => {
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

  // Get dynamic explanation based on current state
  const getExplanation = () => {
    const det = getDeterminant(getTransformMatrix());
    const isIdentity = rotation === 0 && scale === 1;
    const isPureRotation = scale === 1 && rotation !== 0;
    const isPureScale = rotation === 0 && scale !== 1;
    const isCollapsed = Math.abs(scale) < 0.01;
    const isNegative = scale < 0;

    if (isIdentity) {
      return {
        title: "Identity Matrix",
        description: "No transformation applied. The F remains in its original position and size.",
        insight: "The identity matrix [[1,0],[0,1]] leaves everything unchanged."
      };
    }

    if (isCollapsed) {
      return {
        title: "⚠️ Collapsed to a Point!",
        description: "The F has shrunk to nearly zero size. All area is lost.",
        insight: "When scale approaches 0, determinant → 0, meaning the shape loses its 2D area and becomes 1D (a line) or 0D (a point)."
      };
    }

    if (isPureRotation) {
      return {
        title: "Pure Rotation",
        description: `The F is rotating ${Math.abs(rotation)}° ${rotation > 0 ? 'counter-clockwise' : 'clockwise'}. Notice how it spins but doesn't change size.`,
        insight: "Rotation preserves area! That's why determinant stays at 1.00. The shape spins but doesn't stretch."
      };
    }

    if (isPureScale) {
      const growing = scale > 1;
      return {
        title: growing ? "Scaling Up" : "Scaling Down",
        description: `The F is ${growing ? 'growing' : 'shrinking'} uniformly by ${scale.toFixed(2)}x. ${growing ? 'Each side gets longer.' : 'Each side gets shorter.'}`,
        insight: `Area scales by scale² = ${scale.toFixed(2)}² = ${det.toFixed(2)}. That's why determinant = ${det.toFixed(2)}.`
      };
    }

    if (isNegative) {
      return {
        title: "Negative Scale (Reflection!)",
        description: `The F is reflected (flipped) and scaled by ${Math.abs(scale).toFixed(2)}x. Notice the negative determinant.`,
        insight: "Negative determinant means orientation is reversed - like looking in a mirror. The absolute value tells you the area scaling."
      };
    }

    // Combined transformation
    return {
      title: "Combined Transformation",
      description: `The F is both rotating ${Math.abs(rotation)}° and scaling ${scale.toFixed(2)}x. Two transformations at once!`,
      insight: `Rotation doesn't affect determinant, only scale does. Det = ${det.toFixed(2)} means areas are multiplied by ${det.toFixed(2)}.`
    };
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
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
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
                Scale: {scale.toFixed(2)}x {scale < 0 && '(Reflected)'}
              </label>
              <input
                type="range"
                min="-3"
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
              <div className={`text-2xl font-bold ${determinant < 0 ? 'text-orange-400' : 'text-cyan-400'}`}>
                {determinant.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {determinant < 0 ? '⚠️ Orientation flipped!' : 'Area scaling factor'}
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

            {/* Live Explanation */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30 p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                💡 {getExplanation().title}
              </h3>
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {getExplanation().description}
              </p>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-cyan-400">Key Insight:</strong> {getExplanation().insight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};