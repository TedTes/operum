import React, { useState, useEffect, useRef } from 'react';

export const LinearRegression = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [showResiduals, setShowResiduals] = useState(true);
  const [showLine, setShowLine] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [gradientStep, setGradientStep] = useState(0);
  const [learningRate, setLearningRate] = useState(0.01);
  const [currentParams, setCurrentParams] = useState({ m: 0, b: 0 });

  // Initialize with sample data
  useEffect(() => {
    loadPreset('linear');
  }, []);

  // Calculate optimal line parameters using least squares
  const calculateRegression = () => {
    if (points.length < 2) return { m: 0, b: 0 };

    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    return { m, b };
  };

  const optimalParams = calculateRegression();

  // Calculate statistics
  const calculateStats = () => {
    if (points.length < 2) return { r2: 0, mse: 0, rmse: 0 };

    const yMean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    let ssTot = 0;
    let ssRes = 0;
    let sumSquaredError = 0;

    points.forEach(point => {
      const yPred = optimalParams.m * point.x + optimalParams.b;
      ssTot += Math.pow(point.y - yMean, 2);
      ssRes += Math.pow(point.y - yPred, 2);
      sumSquaredError += Math.pow(point.y - yPred, 2);
    });

    const r2 = 1 - (ssRes / ssTot);
    const mse = sumSquaredError / points.length;
    const rmse = Math.sqrt(mse);

    return { r2: Math.max(0, Math.min(1, r2)), mse, rmse };
  };

  const stats = calculateStats();

  // Gradient descent step
  const performGradientStep = () => {
    if (points.length < 2) return;

    let gradM = 0;
    let gradB = 0;

    points.forEach(point => {
      const yPred = currentParams.m * point.x + currentParams.b;
      const error = yPred - point.y;
      gradM += error * point.x;
      gradB += error;
    });

    gradM = (2 * gradM) / points.length;
    gradB = (2 * gradB) / points.length;

    setCurrentParams(prev => ({
      m: prev.m - learningRate * gradM,
      b: prev.b - learningRate * gradB
    }));

    setGradientStep(prev => prev + 1);
  };

  // Animation for gradient descent
  useEffect(() => {
    if (animating) {
      const interval = setInterval(() => {
        performGradientStep();
      }, 50);

      // Stop when close enough
      const diff = Math.abs(currentParams.m - optimalParams.m) + Math.abs(currentParams.b - optimalParams.b);
      if (diff < 0.01) {
        setAnimating(false);
      }

      return () => clearInterval(interval);
    }
  }, [animating, currentParams, optimalParams]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Margins and scaling
    const margin = 50;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;

    // Determine data range
    const xMin = 0;
    const xMax = 10;
    const yMin = 0;
    const yMax = 10;

    const scaleX = (x) => margin + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const scaleY = (y) => height - margin - ((y - yMin) / (yMax - yMin)) * plotHeight;
    const unscaleX = (screenX) => xMin + ((screenX - margin) / plotWidth) * (xMax - xMin);
    const unscaleY = (screenY) => yMin + ((height - margin - screenY) / plotHeight) * (yMax - yMin);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const x = scaleX(i);
      const y = scaleY(i);

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText(i.toString(), x - 5, height - margin + 20);
      ctx.fillText(i.toString(), margin - 25, y + 4);
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px sans-serif';
    ctx.fillText('X', width - margin + 10, height - margin + 5);
    ctx.fillText('Y', margin - 5, margin - 10);

    // Draw regression line
    if (showLine && points.length >= 2) {
      const params = animating ? currentParams : optimalParams;
      
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const x1 = xMin;
      const y1 = params.m * x1 + params.b;
      const x2 = xMax;
      const y2 = params.m * x2 + params.b;

      ctx.moveTo(scaleX(x1), scaleY(y1));
      ctx.lineTo(scaleX(x2), scaleY(y2));
      ctx.stroke();

      // Draw equation on line
      const midX = (x1 + x2) / 2;
      const midY = params.m * midX + params.b;
      const screenX = scaleX(midX);
      const screenY = scaleY(midY);

      ctx.fillStyle = 'rgba(6, 182, 212, 1)';
      ctx.font = 'bold 14px monospace';
      const equation = `y = ${params.m.toFixed(2)}x + ${params.b.toFixed(2)}`;
      const textWidth = ctx.measureText(equation).width;
      
      // Background for text
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(screenX - textWidth / 2 - 5, screenY - 25, textWidth + 10, 20);
      
      ctx.fillStyle = 'rgba(6, 182, 212, 1)';
      ctx.fillText(equation, screenX - textWidth / 2, screenY - 10);
    }

    // Draw residuals
    if (showResiduals && showLine && points.length >= 2) {
      const params = animating ? currentParams : optimalParams;
      
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      points.forEach(point => {
        const yPred = params.m * point.x + params.b;
        ctx.beginPath();
        ctx.moveTo(scaleX(point.x), scaleY(point.y));
        ctx.lineTo(scaleX(point.x), scaleY(yPred));
        ctx.stroke();
      });

      ctx.setLineDash([]);
    }

    // Draw points
    points.forEach((point, index) => {
      const screenX = scaleX(point.x);
      const screenY = scaleY(point.y);

      // Determine if this is an outlier (residual > 2 * RMSE)
      const params = animating ? currentParams : optimalParams;
      const yPred = params.m * point.x + params.b;
      const residual = Math.abs(point.y - yPred);
      const isOutlier = residual > 2 * stats.rmse && stats.rmse > 0;

      // Point color
      const baseColor = isOutlier ? '#f59e0b' : '#8b5cf6';
      const glowColor = isOutlier ? 'rgba(245, 158, 11, 0.4)' : 'rgba(139, 92, 246, 0.4)';

      // Glow
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Point
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Highlight if dragging
      if (draggingIndex === index) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Store scaling functions for mouse interaction
    canvas.scaleX = scaleX;
    canvas.scaleY = scaleY;
    canvas.unscaleX = unscaleX;
    canvas.unscaleY = unscaleY;

  }, [points, showResiduals, showLine, draggingIndex, animating, currentParams, optimalParams, stats]);

  // Mouse handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicking near a point
    let foundIndex = -1;
    points.forEach((point, index) => {
      const screenX = canvas.scaleX(point.x);
      const screenY = canvas.scaleY(point.y);
      const dist = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2);
      
      if (dist < 15) {
        foundIndex = index;
      }
    });

    if (foundIndex >= 0) {
      setDraggingIndex(foundIndex);
    } else {
      // Add new point
      const dataX = canvas.unscaleX(mouseX);
      const dataY = canvas.unscaleY(mouseY);

      if (dataX >= 0 && dataX <= 10 && dataY >= 0 && dataY <= 10) {
        setPoints([...points, { x: dataX, y: dataY }]);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dataX = Math.max(0, Math.min(10, canvas.unscaleX(mouseX)));
    const dataY = Math.max(0, Math.min(10, canvas.unscaleY(mouseY)));

    setPoints(prev => prev.map((p, i) => 
      i === draggingIndex ? { x: dataX, y: dataY } : p
    ));
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const handleDeleteLast = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPoints([]);
    setGradientStep(0);
    setCurrentParams({ m: 0, b: 0 });
  };

  const loadPreset = (type) => {
    setAnimating(false);
    setGradientStep(0);
    setCurrentParams({ m: 0, b: 0 });

    switch (type) {
      case 'linear':
        setPoints([
          { x: 1, y: 2 }, { x: 2, y: 3.5 }, { x: 3, y: 4.2 },
          { x: 4, y: 5.8 }, { x: 5, y: 6.5 }, { x: 6, y: 7.8 },
          { x: 7, y: 8.2 }, { x: 8, y: 9.1 }, { x: 9, y: 9.5 }
        ]);
        break;
      case 'noisy':
        const noisyPoints = [];
        for (let i = 1; i <= 12; i++) {
          noisyPoints.push({
            x: i * 0.8,
            y: 1.2 * i * 0.8 + 1 + (Math.random() - 0.5) * 2
          });
        }
        setPoints(noisyPoints);
        break;
      case 'outliers':
        setPoints([
          { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 },
          { x: 4, y: 5 }, { x: 5, y: 8 }, // outlier
          { x: 6, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 2 }, // outlier
          { x: 9, y: 10 }
        ]);
        break;
      case 'quadratic':
        const quadPoints = [];
        for (let i = 1; i <= 9; i++) {
          const x = i;
          const y = 0.15 * x * x + 1;
          quadPoints.push({ x, y: y + (Math.random() - 0.5) * 0.5 });
        }
        setPoints(quadPoints);
        break;
      default:
        break;
    }
  };

  const startGradientDescent = () => {
    setCurrentParams({ m: 0, b: 0 });
    setGradientStep(0);
    setAnimating(true);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <canvas
          ref={canvasRef}
          width={700}
          height={700}
          className="max-w-full h-auto cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Presets */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Load Dataset</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'linear', name: 'Linear', icon: '📈' },
              { id: 'noisy', name: 'Noisy', icon: '🎲' },
              { id: 'outliers', name: 'Outliers', icon: '⚠️' },
              { id: 'quadratic', name: 'Curved', icon: '📊' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset.id)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs transition-all flex items-center gap-2"
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Display</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showLine}
                onChange={(e) => setShowLine(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-sm text-gray-300">Show Regression Line</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showResiduals}
                onChange={(e) => setShowResiduals(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500"
              />
              <span className="text-sm text-gray-300">Show Residuals</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4 space-y-2">
          <button
            onClick={startGradientDescent}
            disabled={points.length < 2 || animating}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
              points.length < 2 || animating
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {animating ? '⏳ Training...' : '🎯 Animate Fitting'}
          </button>
          <button
            onClick={handleDeleteLast}
            disabled={points.length === 0}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Last Point
          </button>
          <button
            onClick={handleClear}
            className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-semibold transition-all border border-red-500/30 text-sm text-red-400"
          >
            Clear All
          </button>
        </div>

        {/* Statistics */}
        {points.length >= 2 && (
          <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Statistics</h3>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Data Points:</span>
                <span className="font-mono text-white">{points.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slope (m):</span>
                <span className="font-mono text-cyan-400">{optimalParams.m.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Intercept (b):</span>
                <span className="font-mono text-cyan-400">{optimalParams.b.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">R² Score:</span>
                <span className={`font-mono ${
                  stats.r2 > 0.9 ? 'text-emerald-400' : 
                  stats.r2 > 0.7 ? 'text-yellow-400' : 'text-orange-400'
                }`}>
                  {stats.r2.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RMSE:</span>
                <span className="font-mono text-purple-400">{stats.rmse.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Gradient Descent Info */}
        {animating && (
          <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
            <h3 className="text-xs font-semibold text-purple-400 mb-2">
              Gradient Descent
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Steps:</span>
                <span className="font-mono text-white">{gradientStep}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current m:</span>
                <span className="font-mono text-purple-400">{currentParams.m.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current b:</span>
                <span className="font-mono text-purple-400">{currentParams.b.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className={`rounded-xl border p-3 ${
          stats.r2 > 0.9 
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : stats.r2 > 0.7
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">
              {stats.r2 > 0.9 ? '🎯' : stats.r2 > 0.7 ? '📊' : '⚠️'}
            </span>
            <h3 className={`text-xs font-bold ${
              stats.r2 > 0.9 ? 'text-emerald-400' : 
              stats.r2 > 0.7 ? 'text-yellow-400' : 'text-orange-400'
            }`}>
              {stats.r2 > 0.9 ? 'Excellent Fit!' : 
               stats.r2 > 0.7 ? 'Good Fit' : 'Poor Fit'}
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {points.length < 2 
              ? 'Click to add points, drag to move them!'
              : stats.r2 > 0.9
              ? 'Strong linear relationship. The line explains most of the variance.'
              : stats.r2 > 0.7
              ? 'Moderate linear relationship. Some scatter around the line.'
              : 'Weak linear fit. Data may not be linear, or has high noise/outliers.'}
          </p>
        </div>
      </div>
    </div>
  );
};