import React, { useState, useEffect, useRef } from 'react';

export const LagrangeMultipliers = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [lambda, setLambda] = useState(1.5);
  const [showGradients, setShowGradients] = useState(true);
  const [showConstraint, setShowConstraint] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [rotation, setRotation] = useState(45);

  // Objective function: f(x,y) = x² + y²
  const objectiveFunction = (x, y) => {
    return x * x + y * y;
  };

  // Constraint: g(x,y) = x + y - 2 = 0  (line: y = 2 - x)
  const constraintFunction = (x, y) => {
    return x + y - 2;
  };

  // Gradient of objective: ∇f = (2x, 2y)
  const gradientF = (x, y) => {
    return { dx: 2 * x, dy: 2 * y };
  };

  // Gradient of constraint: ∇g = (1, 1)
  const gradientG = (x, y) => {
    return { dx: 1, dy: 1 };
  };

  // Solution: where ∇f = λ∇g on the constraint
  // For this simple case: x = y = 1 (minimum on the line)
  const solution = { x: 1, y: 1 };

  // 3D projection helper
  const project3D = (x, y, z, centerX, centerY, scale, rot) => {
    const rotRad = (rot * Math.PI) / 180;
    
    // Rotate around Y axis
    const x1 = x * Math.cos(rotRad) - z * Math.sin(rotRad);
    const z1 = x * Math.sin(rotRad) + z * Math.cos(rotRad);
    
    // Isometric projection
    const screenX = centerX + (x1 - y) * scale;
    const screenY = centerY + (x1 + y) * scale * 0.5 - z1 * scale * 0.8;
    
    return { x: screenX, y: screenY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.6;
    const scale = 60;

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

    // Draw objective function surface (paraboloid)
    if (showConstraint) {
      const gridSize = 3;
      const step = 0.3;
      
      for (let x = -gridSize; x <= gridSize; x += step) {
        for (let y = -gridSize; y <= gridSize; y += step) {
          const z = objectiveFunction(x, y);
          
          if (z < 20) { // Only draw reasonable values
            const intensity = Math.min(z / 15, 1);
            ctx.fillStyle = `rgba(${Math.floor(100 + intensity * 100)}, ${Math.floor(100 - intensity * 50)}, ${Math.floor(200 - intensity * 100)}, 0.3)`;
            
            const p = project3D(x, y, z, centerX, centerY, scale, rotation);
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          }
        }
      }
    }

    // Draw constraint line (elevated on the surface)
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(251, 146, 60, 0.5)';
    ctx.beginPath();
    
    for (let x = -2; x <= 4; x += 0.1) {
      const y = 2 - x; // Constraint line
      const z = objectiveFunction(x, y);
      const p = project3D(x, y, z, centerX, centerY, scale, rotation);
      
      if (x === -2) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw solution point
    const solZ = objectiveFunction(solution.x, solution.y);
    const solP = project3D(solution.x, solution.y, solZ, centerX, centerY, scale, rotation);
    
    // Glow effect
    const gradient = ctx.createRadialGradient(
      solP.x, solP.y, 0,
      solP.x, solP.y, 20
    );
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.4)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(solP.x, solP.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Point itself
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(solP.x, solP.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw gradients if enabled
    if (showGradients) {
      const arrowScale = 0.8;
      
      // Gradient of f (objective)
      const gradF = gradientF(solution.x, solution.y);
      const gradFEnd = {
        x: solution.x + gradF.dx * arrowScale,
        y: solution.y + gradF.dy * arrowScale,
        z: solZ
      };
      
      const pStart = project3D(solution.x, solution.y, solZ, centerX, centerY, scale, rotation);
      const pEnd = project3D(gradFEnd.x, gradFEnd.y, gradFEnd.z, centerX, centerY, scale, rotation);
      
      drawArrow(ctx, pStart.x, pStart.y, pEnd.x, pEnd.y, '#06b6d4', '∇f');
      
      // Gradient of g (constraint)
      const gradG = gradientG(solution.x, solution.y);
      const gradGEnd = {
        x: solution.x + gradG.dx * arrowScale,
        y: solution.y + gradG.dy * arrowScale,
        z: solZ
      };
      
      const pEndG = project3D(gradGEnd.x, gradGEnd.y, gradGEnd.z, centerX, centerY, scale, rotation);
      
      drawArrow(ctx, pStart.x, pStart.y, pEndG.x, pEndG.y, '#ec4899', '∇g');
      
      // Lambda * gradient of g (scaled)
      const lambdaGradG = {
        x: solution.x + gradG.dx * lambda * arrowScale,
        y: solution.y + gradG.dy * lambda * arrowScale,
        z: solZ
      };
      
      const pLambda = project3D(lambdaGradG.x, lambdaGradG.y, lambdaGradG.z, centerX, centerY, scale, rotation);
      
      drawArrow(ctx, pStart.x, pStart.y, pLambda.x, pLambda.y, '#8b5cf6', 'λ∇g');
    }

    // Draw labels
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Optimal Point', solP.x + 15, solP.y - 15);
    
    // Draw constraint line label
    const labelX = 2, labelY = 0;
    const labelZ = objectiveFunction(labelX, labelY);
    const labelP = project3D(labelX, labelY, labelZ, centerX, centerY, scale, rotation);
    
    ctx.fillStyle = 'rgba(251, 146, 60, 1)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Constraint: x + y = 2', labelP.x + 10, labelP.y);

  }, [lambda, showGradients, showConstraint, rotation]);

  // Helper to draw arrow
  const drawArrow = (ctx, fromX, fromY, toX, toY, color, label) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLen = 12;
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLen * Math.cos(angle - Math.PI / 6),
      toY - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLen * Math.cos(angle + Math.PI / 6),
      toY - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
    
    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(label, toX + 8, toY - 8);
  };

  const handleReset = () => {
    setLambda(1.5);
    setRotation(45);
    setShowGradients(true);
    setShowConstraint(true);
  };

  const checkAlignment = () => {
    // Check if ∇f ≈ λ∇g
    const gradF = gradientF(solution.x, solution.y);
    const gradG = gradientG(solution.x, solution.y);
    
    const diff = Math.sqrt(
      Math.pow(gradF.dx - lambda * gradG.dx, 2) +
      Math.pow(gradF.dy - lambda * gradG.dy, 2)
    );
    
    return diff < 0.5;
  };

  const isAligned = checkAlignment();

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
                className="w-full rounded-lg"
              />
            </div>

            {/* Problem Statement */}
            <div className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Problem Setup
              </h3>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <span className="text-cyan-400">Minimize:</span>
                  <span className="text-white ml-2">f(x,y) = x² + y²</span>
                </div>
                <div>
                  <span className="text-orange-400">Subject to:</span>
                  <span className="text-white ml-2">g(x,y) = x + y - 2 = 0</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-purple-400">Lagrangian:</span>
                  <span className="text-white ml-2">L(x,y,λ) = x² + y² + λ(x + y - 2)</span>
                </div>
                <div className="pt-2">
                  <span className="text-emerald-400">Solution:</span>
                  <span className="text-white ml-2">x = 1, y = 1, λ = 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Lambda Control */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">
                Lambda (λ): {lambda.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.abs(lambda - 2) < 0.3 ? '✅ Near optimal!' : '⚠️ Try λ ≈ 2'}
              </p>
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
                  checked={showGradients}
                  onChange={(e) => setShowGradients(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500"
                />
                <span className="text-sm text-gray-300">Show Gradients</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConstraint}
                  onChange={(e) => setShowConstraint(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-sm text-gray-300">Show Surface</span>
              </label>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 text-sm"
            >
              Reset
            </button>

            {/* Alignment Status */}
            <div className={`rounded-xl border p-3 ${
              isAligned 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{isAligned ? '✅' : '⚠️'}</span>
                <h3 className={`text-xs font-bold ${
                  isAligned ? 'text-emerald-400' : 'text-orange-400'
                }`}>
                  {isAligned ? 'Gradients Aligned!' : 'Not at Optimum'}
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isAligned 
                  ? 'When ∇f = λ∇g, we\'ve found the constrained optimum. The gradients point in the same direction!'
                  : 'At the optimum, ∇f must be parallel to ∇g. Adjust λ to see them align.'}
              </p>
            </div>

            {/* Gradient Info */}
            {showGradients && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">
                  Gradient Values at (1,1)
                </h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-cyan-400">∇f:</span>
                    <span className="text-white">(2, 2)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pink-400">∇g:</span>
                    <span className="text-white">(1, 1)</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5">
                    <span className="text-purple-400">λ∇g:</span>
                    <span className="text-white">({lambda.toFixed(1)}, {lambda.toFixed(1)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difference:</span>
                    <span className="text-white">{Math.abs(2 - lambda).toFixed(2)}</span>
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
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-400">Optimal point (1, 1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-orange-500 rounded"></div>
                  <span className="text-gray-400">Constraint line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-cyan-500 rounded"></div>
                  <span className="text-gray-400">∇f (objective gradient)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-pink-500 rounded"></div>
                  <span className="text-gray-400">∇g (constraint gradient)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-purple-500 rounded"></div>
                  <span className="text-gray-400">λ∇g (scaled gradient)</span>
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