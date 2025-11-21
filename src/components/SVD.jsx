import React, { useState, useEffect, useRef } from 'react';

const SVD = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [rank, setRank] = useState(2);
  const [maxRank, setMaxRank] = useState(2);
  const [animationStep, setAnimationStep] = useState(0); // 0=original, 1=V^T, 2=Σ, 3=U, 4=result
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Simple shape data (points of a letter 'A')
  const originalPoints = [
    // Left leg
    { x: -50, y: 60 }, { x: -20, y: -60 },
    // Right leg
    { x: 20, y: -60 }, { x: 50, y: 60 },
    // Crossbar
    { x: -25, y: 0 }, { x: 25, y: 0 }
  ];

  // Create data matrix from points
  const createDataMatrix = () => {
    const X = [];
    for (let i = 0; i < originalPoints.length; i++) {
      X.push([originalPoints[i].x, originalPoints[i].y]);
    }
    return X;
  };

  // Simple SVD computation (for 2D case)
  const computeSVD = (matrix) => {
    // For simplicity, we'll use a predefined decomposition
    // In reality, you'd use a library like math.js
    
    // This is a simplified example - actual SVD is more complex
    const U = [
      [0.8, 0.6],
      [0.6, -0.8]
    ];
    
    const S = [45, 25]; // Singular values
    
    const VT = [
      [0.9, 0.436],
      [-0.436, 0.9]
    ];
    
    return { U, S, VT };
  };

  // Matrix multiplication
  const matrixMultiply = (A, B) => {
    const result = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  };

  // Apply transformation to points
  const transformPoints = (points, matrix) => {
    return points.map(p => {
      const vec = [p.x, p.y];
      const result = [
        matrix[0][0] * vec[0] + matrix[0][1] * vec[1],
        matrix[1][0] * vec[0] + matrix[1][1] * vec[1]
      ];
      return { x: result[0], y: result[1] };
    });
  };

  const { U, S, VT } = computeSVD(createDataMatrix());

  // Get transformed points based on animation step
  const getTransformedPoints = () => {
    let points = originalPoints;
    
    if (animationStep >= 1) {
      // Apply V^T
      points = transformPoints(points, VT);
    }
    
    if (animationStep >= 2) {
      // Apply Σ (scaling)
      const scale = rank >= 1 ? S[0] / 50 : 0;
      const scale2 = rank >= 2 ? S[1] / 50 : 0;
      const sigma = [[scale, 0], [0, scale2]];
      points = transformPoints(points, sigma);
    }
    
    if (animationStep >= 3) {
      // Apply U
      points = transformPoints(points, U);
    }
    
    return points;
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

    // Draw axes
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw original shape (faint)
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < originalPoints.length; i += 2) {
      if (i + 1 < originalPoints.length) {
        ctx.beginPath();
        ctx.moveTo(centerX + originalPoints[i].x, centerY + originalPoints[i].y);
        ctx.lineTo(centerX + originalPoints[i + 1].x, centerY + originalPoints[i + 1].y);
        ctx.stroke();
      }
    }

    // Draw transformed shape
    const transformed = getTransformedPoints();
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#06b6d4');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
    
    for (let i = 0; i < transformed.length; i += 2) {
      if (i + 1 < transformed.length) {
        ctx.beginPath();
        ctx.moveTo(centerX + transformed[i].x, centerY + transformed[i].y);
        ctx.lineTo(centerX + transformed[i + 1].x, centerY + transformed[i + 1].y);
        ctx.stroke();
      }
    }
    
    ctx.shadowBlur = 0;

    // Draw points
    transformed.forEach((p, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#06b6d4' : '#ec4899';
      ctx.beginPath();
      ctx.arc(centerX + p.x, centerY + p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw step label
    const stepLabels = ['Original', 'After V^T', 'After Σ', 'After U', 'Result'];
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(stepLabels[animationStep], 20, 30);

  }, [animationStep, rank]);

  // Animation control
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationStep(prev => {
          if (prev >= 4) {
            setIsAnimating(false);
            return 4;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const handlePlayAnimation = () => {
    setAnimationStep(0);
    setIsAnimating(true);
  };

  const handleReset = () => {
    setAnimationStep(0);
    setIsAnimating(false);
    setRank(2);
  };

  const compressionRatio = ((1 - rank / maxRank) * 100).toFixed(0);

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-3 md:p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={450}
                className="w-full rounded-lg"
              />
            </div>

            {/* Decomposition Formula */}
            <div className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Decomposition: A = U Σ V^T
              </h3>
              <div className="grid grid-cols-5 gap-2 items-center text-center text-xs font-mono">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                  <div className="text-purple-400 font-bold mb-1">A</div>
                  <div className="text-gray-400">Original</div>
                </div>
                <div className="text-gray-500">=</div>
                <div className="bg-cyan-500/20 border border-cyan-500/30 rounded p-2">
                  <div className="text-cyan-400 font-bold mb-1">U</div>
                  <div className="text-gray-400">Rotation</div>
                </div>
                <div className="text-gray-500">×</div>
                <div className="bg-orange-500/20 border border-orange-500/30 rounded p-2">
                  <div className="text-orange-400 font-bold mb-1">Σ</div>
                  <div className="text-gray-400">Scale</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 items-center text-center text-xs font-mono">
                <div></div>
                <div className="text-gray-500">×</div>
                <div className="bg-pink-500/20 border border-pink-500/30 rounded p-2">
                  <div className="text-pink-400 font-bold mb-1">V^T</div>
                  <div className="text-gray-400">Rotation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Rank Control */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">
                Rank: {rank} / {maxRank}
              </label>
              <input
                type="range"
                min="0"
                max={maxRank}
                value={rank}
                onChange={(e) => {
                  setRank(Number(e.target.value));
                  setAnimationStep(4); // Show result
                }}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">
                {rank === 0 && '⚠️ Zero rank - no information'}
                {rank === 1 && '📊 Rank 1 - dominant pattern only'}
                {rank === maxRank && '✅ Full rank - complete information'}
                {rank > 1 && rank < maxRank && `📉 Reduced rank - ${compressionRatio}% compression`}
              </p>
            </div>

            {/* Animation Controls */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePlayAnimation}
                disabled={isAnimating}
                className="px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnimating ? 'Playing...' : 'Play Animation'}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 md:px-4 md:py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all border border-white/10"
              >
                Reset
              </button>
            </div>

            {/* Step Navigator */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Manual Step Control
              </label>
              <div className="grid grid-cols-5 gap-1">
                {['0', '1', '2', '3', '4'].map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAnimationStep(idx);
                      setIsAnimating(false);
                    }}
                    className={`px-2 py-2 rounded text-xs font-semibold transition-all ${
                      animationStep === idx
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-gray-400'
                    }`}
                  >
                    {['Orig', 'V^T', 'Σ', 'U', 'Done'][idx]}
                  </button>
                ))}
              </div>
            </div>

            {/* Singular Values */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Singular Values
              </h3>
              <div className="space-y-2">
                {S.map((sigma, idx) => {
                  const width = (sigma / S[0]) * 100;
                  const isActive = idx < rank;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">σ{idx + 1}</span>
                        <span className={`font-mono ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>
                          {sigma.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                              : 'bg-gray-700'
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Compression Info
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Original Rank:</span>
                  <span className="font-mono text-white">{maxRank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Rank:</span>
                  <span className="font-mono text-cyan-400">{rank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Compression:</span>
                  <span className="font-mono text-purple-400">{compressionRatio}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Info Retained:</span>
                  <span className="font-mono text-emerald-400">
                    {((rank / maxRank) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">💡</span>
                <h3 className="text-xs font-bold text-cyan-400">
                  What's Happening?
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {animationStep === 0 && 'Original shape before decomposition.'}
                {animationStep === 1 && 'First rotation (V^T) aligns the shape with principal axes.'}
                {animationStep === 2 && 'Scaling (Σ) stretches along those axes. Lower rank = less stretching.'}
                {animationStep === 3 && 'Second rotation (U) puts everything in final orientation.'}
                {animationStep === 4 && 'Final result! Lower rank = more compression, less detail.'}
              </p>
            </div>

            {/* Legend */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Legend
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gray-500/30 rounded"></div>
                  <span className="text-gray-400">Original shape (faint)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 rounded"></div>
                  <span className="text-gray-400">Transformed shape</span>
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

export default SVD;