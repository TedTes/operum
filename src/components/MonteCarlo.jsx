import React, { useState, useEffect, useRef } from 'react';

export const MonteCarlo = ({ onClose }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [method, setMethod] = useState('pi'); // 'pi', 'integration', 'random-walk'
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [samples, setSamples] = useState([]);
  const [totalSamples, setTotalSamples] = useState(0);
  const [insideCount, setInsideCount] = useState(0);
  const [walkPath, setWalkPath] = useState([{ x: 0, y: 0 }]);
  const [integralSum, setIntegralSum] = useState(0);

  // Reset when method changes
  useEffect(() => {
    handleReset();
  }, [method]);

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        addSample();
      }, 100 / speed);
      
      animationRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isRunning, speed, method, totalSamples, insideCount, walkPath, integralSum]);

  const addSample = () => {
    if (method === 'pi') {
      // Monte Carlo Pi estimation
      const x = Math.random() * 2 - 1; // [-1, 1]
      const y = Math.random() * 2 - 1; // [-1, 1]
      const distance = Math.sqrt(x * x + y * y);
      const inside = distance <= 1;
      
      setSamples(prev => [...prev, { x, y, inside }].slice(-1000)); // Keep last 1000
      setTotalSamples(prev => prev + 1);
      setInsideCount(prev => inside ? prev + 1 : prev);
      
    } else if (method === 'integration') {
      // Monte Carlo integration of f(x) = x^2
      const x = Math.random(); // [0, 1]
      const y = Math.random(); // [0, 1]
      const fx = x * x; // Function to integrate
      const inside = y <= fx;
      
      setSamples(prev => [...prev, { x, y, inside, fx }].slice(-1000));
      setTotalSamples(prev => prev + 1);
      setInsideCount(prev => inside ? prev + 1 : prev);
      setIntegralSum(prev => prev + fx); // Sum for average
      
    } else if (method === 'random-walk') {
      // 2D Random Walk
      setWalkPath(prev => {
        const last = prev[prev.length - 1];
        const angle = Math.random() * 2 * Math.PI;
        const step = 0.1;
        const newX = last.x + Math.cos(angle) * step;
        const newY = last.y + Math.sin(angle) * step;
        
        // Keep path from getting too long
        const newPath = [...prev, { x: newX, y: newY }];
        return newPath.length > 500 ? newPath.slice(-500) : newPath;
      });
      setTotalSamples(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSamples([]);
    setTotalSamples(0);
    setInsideCount(0);
    setWalkPath([{ x: 0, y: 0 }]);
    setIntegralSum(0);
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.8;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (method === 'pi') {
      drawPiEstimation(ctx, centerX, centerY, size);
    } else if (method === 'integration') {
      drawIntegration(ctx, centerX, centerY, size);
    } else if (method === 'random-walk') {
      drawRandomWalk(ctx, centerX, centerY, size);
    }

  }, [samples, method, walkPath]);

  const drawPiEstimation = (ctx, centerX, centerY, size) => {
    const radius = size / 2;

    // Draw square
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - radius, centerY - radius, size, size);

    // Draw circle
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw samples
    samples.forEach(sample => {
      const x = centerX + sample.x * radius;
      const y = centerY + sample.y * radius;
      
      ctx.fillStyle = sample.inside 
        ? 'rgba(34, 197, 94, 0.6)'  // Green inside
        : 'rgba(239, 68, 68, 0.6)';  // Red outside
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px monospace';
    ctx.fillText('Circle', centerX - 25, centerY - radius - 10);
    ctx.fillText('Square', centerX + radius + 10, centerY - radius + 20);
  };

  const drawIntegration = (ctx, centerX, centerY, size) => {
    const padding = 40;
    const graphSize = size - padding * 2;
    const originX = centerX - graphSize / 2;
    const originY = centerY + graphSize / 2;

    // Draw axes
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + graphSize, originY); // X-axis
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - graphSize); // Y-axis
    ctx.stroke();

    // Draw function curve f(x) = x^2
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const fx = x * x;
      const screenX = originX + x * graphSize;
      const screenY = originY - fx * graphSize;
      
      if (i === 0) ctx.moveTo(screenX, screenY);
      else ctx.lineTo(screenX, screenY);
    }
    ctx.stroke();

    // Draw bounding box
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(originX, originY - graphSize, graphSize, graphSize);

    // Draw samples
    samples.forEach(sample => {
      const screenX = originX + sample.x * graphSize;
      const screenY = originY - sample.y * graphSize;
      
      ctx.fillStyle = sample.inside
        ? 'rgba(34, 197, 94, 0.6)'  // Green under curve
        : 'rgba(239, 68, 68, 0.6)';  // Red above curve
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText('f(x) = x²', originX + graphSize - 80, originY - graphSize - 5);
    ctx.fillText('0', originX - 15, originY + 15);
    ctx.fillText('1', originX + graphSize, originY + 15);
    ctx.fillText('1', originX - 15, originY - graphSize + 5);
  };

  const drawRandomWalk = (ctx, centerX, centerY, size) => {
    const scale = size / 4;

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale / 2, centerY - size / 2);
      ctx.lineTo(centerX + i * scale / 2, centerY + size / 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - size / 2, centerY + i * scale / 2);
      ctx.lineTo(centerX + size / 2, centerY + i * scale / 2);
      ctx.stroke();
    }

    // Draw origin
    ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw path
    if (walkPath.length > 1) {
      const gradient = ctx.createLinearGradient(
        centerX + walkPath[0].x * scale,
        centerY + walkPath[0].y * scale,
        centerX + walkPath[walkPath.length - 1].x * scale,
        centerY + walkPath[walkPath.length - 1].y * scale
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 1)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      walkPath.forEach((point, i) => {
        const x = centerX + point.x * scale;
        const y = centerY + point.y * scale;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw current position
      const last = walkPath[walkPath.length - 1];
      ctx.fillStyle = 'rgba(139, 92, 246, 1)';
      ctx.beginPath();
      ctx.arc(centerX + last.x * scale, centerY + last.y * scale, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText('Start', centerX + 10, centerY - 10);
  };

  // Calculate results
  const piEstimate = totalSamples > 0 ? (4 * insideCount / totalSamples) : 0;
  const piError = Math.abs(piEstimate - Math.PI);
  const integralEstimate = totalSamples > 0 ? (insideCount / totalSamples) : 0;
  const integralTrue = 1 / 3; // True value of ∫₀¹ x² dx
  const integralError = Math.abs(integralEstimate - integralTrue);
  
  const lastPos = walkPath[walkPath.length - 1];
  const displacement = Math.sqrt(lastPos.x * lastPos.x + lastPos.y * lastPos.y);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="max-w-full h-auto"
        />
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Method Selection */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Monte Carlo Method</h3>
          <div className="space-y-2">
            {[
              { id: 'pi', name: 'Pi Estimation', icon: '🎯', desc: 'Estimate π using random points' },
              { id: 'integration', name: 'Integration', icon: '📊', desc: 'Compute ∫₀¹ x² dx' },
              { id: 'random-walk', name: 'Random Walk', icon: '🚶', desc: '2D Brownian motion' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  method === m.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{m.icon}</span>
                  <span className="font-semibold text-sm">{m.name}</span>
                </div>
                <p className="text-xs text-gray-400">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Control */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Speed</h3>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slow</span>
            <span className="text-cyan-400 font-semibold">{speed}x</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4 space-y-2">
          <button
            onClick={isRunning ? handlePause : handleStart}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={handleReset}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 text-sm"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Results</h3>
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Samples:</span>
              <span className="font-mono text-white">{totalSamples.toLocaleString()}</span>
            </div>

            {method === 'pi' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inside Circle:</span>
                  <span className="font-mono text-emerald-400">{insideCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated π:</span>
                  <span className="font-mono text-cyan-400">{piEstimate.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">True π:</span>
                  <span className="font-mono text-purple-400">{Math.PI.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error:</span>
                  <span className="font-mono text-orange-400">{piError.toFixed(6)}</span>
                </div>
              </>
            )}

            {method === 'integration' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Under Curve:</span>
                  <span className="font-mono text-emerald-400">{insideCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated ∫:</span>
                  <span className="font-mono text-cyan-400">{integralEstimate.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">True ∫₀¹ x²:</span>
                  <span className="font-mono text-purple-400">{integralTrue.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error:</span>
                  <span className="font-mono text-orange-400">{integralError.toFixed(6)}</span>
                </div>
              </>
            )}

            {method === 'random-walk' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Steps:</span>
                  <span className="font-mono text-white">{walkPath.length - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className="font-mono text-cyan-400">
                    ({lastPos.x.toFixed(2)}, {lastPos.y.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Displacement:</span>
                  <span className="font-mono text-purple-400">{displacement.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">√Steps:</span>
                  <span className="font-mono text-gray-500">
                    {Math.sqrt(walkPath.length - 1).toFixed(3)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className={`rounded-xl border p-3 ${
          method === 'pi' 
            ? 'bg-cyan-500/10 border-cyan-500/30'
            : method === 'integration'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-purple-500/10 border-purple-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className={`text-xs font-bold ${
              method === 'pi' ? 'text-cyan-400' : method === 'integration' ? 'text-emerald-400' : 'text-purple-400'
            }`}>
              {method === 'pi' ? 'The Law of Large Numbers' : method === 'integration' ? 'Monte Carlo Integration' : 'Random Walk Theory'}
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {method === 'pi' && 'As samples increase, the ratio (inside/total) → π/4. More samples = better estimate!'}
            {method === 'integration' && 'Random sampling estimates area under curve. Ratio of points below f(x) approximates ∫f(x)dx.'}
            {method === 'random-walk' && 'Expected displacement grows as √steps (diffusion). Each step is random but patterns emerge!'}
          </p>
        </div>
      </div>
    </div>
  );
};