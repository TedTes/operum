import React, { useState, useEffect, useRef } from 'react';

export const ConvexOptimization = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [functionType, setFunctionType] = useState('convex'); // 'convex', 'nonconvex', 'saddle'
  const [showGlobalMin, setShowGlobalMin] = useState(true);
  const [showLocalMinima, setShowLocalMinima] = useState(true);
  const [rotation, setRotation] = useState(45);
  const [startPoint, setStartPoint] = useState({ x: 2, y: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [optimizationPath, setOptimizationPath] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Define different function types
  const functions = {
    convex: {
      name: 'Convex (Paraboloid)',
      fn: (x, y) => x * x + y * y,
      gradient: (x, y) => ({ dx: 2 * x, dy: 2 * y }),
      globalMin: { x: 0, y: 0 },
      localMinima: [],
      description: 'Any local minimum is the global minimum'
    },
    nonconvex: {
      name: 'Non-Convex (Multiple Minima)',
      fn: (x, y) => {
        // Create a function with multiple local minima
        return Math.sin(x * 2) * Math.cos(y * 2) + 0.3 * (x * x + y * y);
      },
      gradient: (x, y) => ({
        dx: 2 * Math.cos(x * 2) * Math.cos(y * 2) + 0.6 * x,
        dy: -2 * Math.sin(x * 2) * Math.sin(y * 2) + 0.6 * y
      }),
      globalMin: { x: 0, y: 0 },
      localMinima: [
        { x: 1.57, y: 1.57 },
        { x: -1.57, y: -1.57 },
        { x: 1.57, y: -1.57 },
        { x: -1.57, y: 1.57 }
      ],
      description: 'Has multiple local minima - gradient descent can get stuck'
    },
    saddle: {
      name: 'Saddle Point',
      fn: (x, y) => x * x - y * y,
      gradient: (x, y) => ({ dx: 2 * x, dy: -2 * y }),
      globalMin: null, // No global minimum
      localMinima: [{ x: 0, y: 0, isSaddle: true }],
      description: 'Has a saddle point at origin - neither min nor max'
    }
  };

  const currentFunc = functions[functionType];

  // 3D projection
  const project3D = (x, y, z, centerX, centerY, scale, rot) => {
    const rotRad = (rot * Math.PI) / 180;
    const x1 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
    const z1 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
    const screenX = centerX + (x1 - y) * scale;
    const screenY = centerY + (x1 + y) * scale * 0.5 - z1 * scale * 0.8;
    return { x: screenX, y: screenY };
  };

  // Run gradient descent
  const runOptimization = () => {
    setIsOptimizing(true);
    const path = [{ ...startPoint }];
    let current = { ...startPoint };
    const learningRate = 0.1;
    const maxSteps = 100;

    for (let i = 0; i < maxSteps; i++) {
      const grad = currentFunc.gradient(current.x, current.y);
      const newX = current.x - learningRate * grad.dx;
      const newY = current.y - learningRate * grad.dy;

      current = { x: newX, y: newY };
      path.push({ ...current });

      // Stop if converged
      const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
      if (gradMag < 0.01) break;
    }

    setOptimizationPath(path);
    setTimeout(() => setIsOptimizing(false), 100);
  };

  // Reset
  const handleReset = () => {
    setStartPoint({ x: 2, y: 1 });
    setOptimizationPath([]);
  };

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.6;
    const scale = 50;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw surface
    const gridSize = 3;
    const step = 0.2;

    for (let x = -gridSize; x <= gridSize; x += step) {
      for (let y = -gridSize; y <= gridSize; y += step) {
        const z = currentFunc.fn(x, y);

        if (Math.abs(z) < 15) {
          const intensity = (z + 5) / 10;
          const r = Math.floor(100 + intensity * 100);
          const g = Math.floor(100);
          const b = Math.floor(200 - intensity * 100);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
          const p = project3D(x, y, z, centerX, centerY, scale, rotation);
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
      }
    }

    // Draw global minimum
    if (showGlobalMin && currentFunc.globalMin) {
      const gMin = currentFunc.globalMin;
      const gZ = currentFunc.fn(gMin.x, gMin.y);
      const gP = project3D(gMin.x, gMin.y, gZ, centerX, centerY, scale, rotation);

      // Glow
      const gradient = ctx.createRadialGradient(gP.x, gP.y, 0, gP.x, gP.y, 25);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.4)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(gP.x, gP.y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Point
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(gP.x, gP.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Global Min', gP.x + 12, gP.y - 12);
    }

    // Draw local minima
    if (showLocalMinima && currentFunc.localMinima.length > 0) {
      currentFunc.localMinima.forEach((lMin) => {
        const lZ = currentFunc.fn(lMin.x, lMin.y);
        const lP = project3D(lMin.x, lMin.y, lZ, centerX, centerY, scale, rotation);

        // Color based on type
        const color = lMin.isSaddle ? '#f59e0b' : '#ef4444';
        const glowColor = lMin.isSaddle ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)';

        // Glow
        const gradient = ctx.createRadialGradient(lP.x, lP.y, 0, lP.x, lP.y, 20);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(lP.x, lP.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lP.x, lP.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Draw optimization path
    if (optimizationPath.length > 1) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';

      ctx.beginPath();
      const firstP = optimizationPath[0];
      const firstZ = currentFunc.fn(firstP.x, firstP.y);
      const firstProj = project3D(firstP.x, firstP.y, firstZ, centerX, centerY, scale, rotation);
      ctx.moveTo(firstProj.x, firstProj.y);

      for (let i = 1; i < optimizationPath.length; i++) {
        const pt = optimizationPath[i];
        const z = currentFunc.fn(pt.x, pt.y);
        const proj = project3D(pt.x, pt.y, z, centerX, centerY, scale, rotation);
        ctx.lineTo(proj.x, proj.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw final point
      const lastP = optimizationPath[optimizationPath.length - 1];
      const lastZ = currentFunc.fn(lastP.x, lastP.y);
      const lastProj = project3D(lastP.x, lastP.y, lastZ, centerX, centerY, scale, rotation);

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(lastProj.x, lastProj.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw start point
    const startZ = currentFunc.fn(startPoint.x, startPoint.y);
    const startProj = project3D(startPoint.x, startPoint.y, startZ, centerX, centerY, scale, rotation);

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(startProj.x, startProj.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Start', startProj.x + 12, startProj.y - 8);

  }, [functionType, rotation, startPoint, optimizationPath, showGlobalMin, showLocalMinima]);

  // Mouse handlers for dragging start point
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if near start point
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.6;
    const scale = 50;
    const startZ = currentFunc.fn(startPoint.x, startPoint.y);
    const startProj = project3D(startPoint.x, startPoint.y, startZ, centerX, centerY, scale, rotation);

    const dist = Math.sqrt((mouseX - startProj.x) ** 2 + (mouseY - startProj.y) ** 2);
    if (dist < 15) {
      setIsDragging(true);
      setOptimizationPath([]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Approximate inverse projection (simplified)
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.6;
    const scale = 50;

    const dx = (mouseX - centerX) / scale;
    const dy = -(mouseY - centerY) / scale;

    const newX = Math.max(-3, Math.min(3, dx));
    const newY = Math.max(-3, Math.min(3, dy));

    setStartPoint({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const isConvex = functionType === 'convex';
  const hasMultipleMinima = currentFunc.localMinima.length > 0;

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-3 md:p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={500}
                className="w-full rounded-lg cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Function Info */}
            <div className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Current Function: {currentFunc.name}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {currentFunc.description}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Function Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Function Type
              </label>
              <div className="space-y-2">
                {Object.entries(functions).map(([key, func]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFunctionType(key);
                      setOptimizationPath([]);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      functionType === key
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {func.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation Control */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                View Rotation: {rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Toggles */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGlobalMin}
                  onChange={(e) => setShowGlobalMin(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm text-gray-300">Show Global Minimum</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLocalMinima}
                  onChange={(e) => setShowLocalMinima(e.target.checked)}
                  className="w-4 h-4 rounded accent-red-500"
                />
                <span className="text-sm text-gray-300">Show Local Minima</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={runOptimization}
                disabled={isOptimizing}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 text-sm"
              >
                {isOptimizing ? 'Optimizing...' : 'Run Gradient Descent'}
              </button>
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 text-sm"
              >
                Reset
              </button>
            </div>

            {/* Convexity Indicator */}
            <div className={`rounded-xl border p-3 ${
              isConvex
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{isConvex ? '✅' : '⚠️'}</span>
                <h3 className={`text-xs font-bold ${
                  isConvex ? 'text-emerald-400' : 'text-orange-400'
                }`}>
                  {isConvex ? 'Convex Function' : 'Non-Convex Function'}
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isConvex
                  ? 'Gradient descent always finds the global minimum! Any local min = global min.'
                  : 'Gradient descent can get stuck in local minima. Starting point matters!'}
              </p>
            </div>

            {/* Optimization Results */}
            {optimizationPath.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">
                  Optimization Results
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Steps taken:</span>
                    <span className="font-mono text-white">{optimizationPath.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Final point:</span>
                    <span className="font-mono text-purple-400">
                      ({optimizationPath[optimizationPath.length - 1].x.toFixed(2)}, 
                       {optimizationPath[optimizationPath.length - 1].y.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Final value:</span>
                    <span className="font-mono text-cyan-400">
                      {currentFunc.fn(
                        optimizationPath[optimizationPath.length - 1].x,
                        optimizationPath[optimizationPath.length - 1].y
                      ).toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Legend
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-gray-400">Start point (drag to move)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-400">Global minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-400">Local minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-gray-400">Saddle point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-purple-500 rounded"></div>
                  <span className="text-gray-400">Optimization path</span>
                </div>
              </div>
            </div>
          </div>
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
      `}</style>
    </div>
  );
};