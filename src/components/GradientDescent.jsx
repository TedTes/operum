import React, { useState, useEffect, useRef } from 'react';

const GradientDescent = ({ onClose }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [learningRate, setLearningRate] = useState(0.1);
  const [speed, setSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState({ x: 2, y: 2 });
  const [path, setPath] = useState([{ x: 2, y: 2 }]);
  const [steps, setSteps] = useState(0);
  const [rotation, setRotation] = useState(45);

  // Loss function: simple paraboloid z = x² + y²
  const lossFunction = (x, y) => {
    return x * x + y * y;
  };

  // Gradient: ∇f = [2x, 2y]
  const gradient = (x, y) => {
    return {
      dx: 2 * x,
      dy: 2 * y
    };
  };

  // Perform one gradient descent step
  const step = () => {
    setPosition(prev => {
      const grad = gradient(prev.x, prev.y);
      const newX = prev.x - learningRate * grad.dx;
      const newY = prev.y - learningRate * grad.dy;
      
      const newPos = { x: newX, y: newY };
      setPath(p => [...p, newPos]);
      setSteps(s => s + 1);
      
      return newPos;
    });
  };

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        step();
      }, 100 / speed);
      
      animationRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isRunning, learningRate, speed, position]);

  // Auto-stop when converged
  useEffect(() => {
    const loss = lossFunction(position.x, position.y);
    if (loss < 0.01 && isRunning) {
      setIsRunning(false);
    }
  }, [position, isRunning]);

  // Draw the surface and ball
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 3D projection parameters
    const scale = 40;
    const rotRad = (rotation * Math.PI) / 180;

    // Project 3D point to 2D
    const project = (x, y, z) => {
      // Rotate around Y axis
      const x1 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
      const z1 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
      
      // Isometric projection
      const screenX = centerX + (x1 - y) * scale;
      const screenY = centerY + (x1 + y) * scale * 0.5 - z1 * scale * 0.8;
      
      return { x: screenX, y: screenY };
    };

    // Draw grid surface
    const gridSize = 5;
    const gridStep = 0.5;

    for (let x = -gridSize; x <= gridSize; x += gridStep) {
      for (let y = -gridSize; y <= gridSize; y += gridStep) {
        const z = lossFunction(x, y);
        
        // Color by height
        const maxZ = gridSize * gridSize * 2;
        const intensity = Math.min(z / maxZ, 1);
        const r = Math.floor(255 * intensity);
        const b = Math.floor(255 * (1 - intensity));
        
        ctx.fillStyle = `rgba(${r}, 100, ${b}, 0.3)`;
        
        const p = project(x, y, z);
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
    }

    // Draw path
    if (path.length > 1) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const firstPoint = path[0];
      const firstZ = lossFunction(firstPoint.x, firstPoint.y);
      const firstProj = project(firstPoint.x, firstPoint.y, firstZ);
      ctx.moveTo(firstProj.x, firstProj.y);
      
      for (let i = 1; i < path.length; i++) {
        const point = path[i];
        const z = lossFunction(point.x, point.y);
        const proj = project(point.x, point.y, z);
        ctx.lineTo(proj.x, proj.y);
      }
      
      ctx.stroke();
    }

    // Draw current position (ball)
    const currentZ = lossFunction(position.x, position.y);
    const ballProj = project(position.x, position.y, currentZ);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    const shadowProj = project(position.x, position.y, 0);
    ctx.arc(shadowProj.x, shadowProj.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball
    const gradient = ctx.createRadialGradient(
      ballProj.x - 3, ballProj.y - 3, 2,
      ballProj.x, ballProj.y, 12
    );
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ballProj.x, ballProj.y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw axes labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px monospace';
    ctx.fillText('X', centerX + gridSize * scale + 10, centerY);
    ctx.fillText('Y', centerX - gridSize * scale - 20, centerY);

  }, [position, path, rotation]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPosition({ x: 2, y: 2 });
    setPath([{ x: 2, y: 2 }]);
    setSteps(0);
  };

  const handleRandom = () => {
    setIsRunning(false);
    const randomX = (Math.random() - 0.5) * 8;
    const randomY = (Math.random() - 0.5) * 8;
    setPosition({ x: randomX, y: randomY });
    setPath([{ x: randomX, y: randomY }]);
    setSteps(0);
  };

  const currentLoss = lossFunction(position.x, position.y);
  const grad = gradient(position.x, position.y);
  const gradientMagnitude = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
  const isConverged = currentLoss < 0.01;

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-3 md:p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full rounded-lg"
              />
              
              {/* Rotation control */}
              <div className="mt-3 md:mt-4">
                <label className="block text-xs font-semibold text-gray-400 mb-2">
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
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Learning Rate */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-1.5 md:mb-2">
                Learning Rate: {learningRate.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.001"
                max="1"
                step="0.001"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500 mt-1">
                {learningRate > 0.5 ? '⚠️ Very high' : learningRate < 0.01 ? '🐌 Very slow' : '✅ Good range'}
              </p>
            </div>

            {/* Speed */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-1.5 md:mb-2">
                Animation Speed: {speed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStart}
                disabled={isRunning || isConverged}
                className="px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start
              </button>
              <button
                onClick={handlePause}
                disabled={!isRunning}
                className="px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pause
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 md:px-4 md:py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all border border-white/10"
              >
                Reset
              </button>
              <button
                onClick={handleRandom}
                className="px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Random
              </button>
            </div>

            {/* Status */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Status
              </h3>
              <div className="space-y-1.5 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Loss:</span>
                  <span className="font-mono text-cyan-400">{currentLoss.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Steps:</span>
                  <span className="font-mono text-white">{steps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gradient:</span>
                  <span className="font-mono text-purple-400">{gradientMagnitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className="font-mono text-white text-xs">
                    ({position.x.toFixed(2)}, {position.y.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            {/* Current State */}
            <div className={`rounded-xl border p-3 ${isConverged ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{isConverged ? '🎯' : isRunning ? '⬇️' : '⏸️'}</span>
                <h3 className={`text-xs font-bold ${isConverged ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isConverged ? 'Converged!' : isRunning ? 'Descending...' : 'Paused'}
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isConverged 
                  ? 'Found the minimum! Loss is near zero.' 
                  : isRunning 
                    ? 'Ball is rolling down the surface toward the minimum.'
                    : 'Click Start to begin optimization.'}
              </p>
            </div>

            {/* Info */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Legend
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <span className="text-gray-400">Current position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-cyan-500 rounded"></div>
                  <span className="text-gray-400">Path taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-blue-500"></div>
                  <span className="text-gray-400">Surface (red=high, blue=low)</span>
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

export default GradientDescent;