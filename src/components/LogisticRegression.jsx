import React, { useState, useEffect, useRef } from 'react';

export const LogisticRegression = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [gradientStep, setGradientStep] = useState(0);
  const [learningRate, setLearningRate] = useState(0.1);
  const [currentParams, setCurrentParams] = useState({ w1: 0, w2: 0, b: 0 });
  const [addingClass, setAddingClass] = useState(1); // 0 or 1

  // Initialize with sample data
  useEffect(() => {
    loadPreset('linearly-separable');
  }, []);

  // Sigmoid function
  const sigmoid = (z) => {
    return 1 / (1 + Math.exp(-z));
  };

  // Predict probability for a point
  const predict = (x, y, params = currentParams) => {
    const z = params.w1 * x + params.w2 * y + params.b;
    return sigmoid(z);
  };

  // Calculate optimal parameters using gradient descent (batch)
  const calculateLogisticRegression = () => {
    if (points.length < 2) return { w1: 0, w2: 0, b: 0 };

    let w1 = 0, w2 = 0, b = 0;
    const iterations = 1000;
    const alpha = 0.1;

    for (let iter = 0; iter < iterations; iter++) {
      let gradW1 = 0, gradW2 = 0, gradB = 0;

      points.forEach(point => {
        const z = w1 * point.x + w2 * point.y + b;
        const pred = sigmoid(z);
        const error = pred - point.label;
        
        gradW1 += error * point.x;
        gradW2 += error * point.y;
        gradB += error;
      });

      w1 -= (alpha / points.length) * gradW1;
      w2 -= (alpha / points.length) * gradW2;
      b -= (alpha / points.length) * gradB;
    }

    return { w1, w2, b };
  };

  const optimalParams = calculateLogisticRegression();

  // Calculate accuracy
  const calculateAccuracy = () => {
    if (points.length === 0) return 0;

    let correct = 0;
    points.forEach(point => {
      const prob = predict(point.x, point.y, optimalParams);
      const prediction = prob >= 0.5 ? 1 : 0;
      if (prediction === point.label) correct++;
    });

    return correct / points.length;
  };

  const accuracy = calculateAccuracy();

  // Calculate log loss
  const calculateLogLoss = () => {
    if (points.length === 0) return 0;

    let loss = 0;
    points.forEach(point => {
      const prob = predict(point.x, point.y, optimalParams);
      const epsilon = 1e-15; // Prevent log(0)
      const clippedProb = Math.max(epsilon, Math.min(1 - epsilon, prob));
      
      loss += -point.label * Math.log(clippedProb) - (1 - point.label) * Math.log(1 - clippedProb);
    });

    return loss / points.length;
  };

  const logLoss = calculateLogLoss();

  // Gradient descent step
  const performGradientStep = () => {
    if (points.length < 2) return;

    let gradW1 = 0, gradW2 = 0, gradB = 0;

    points.forEach(point => {
      const prob = predict(point.x, point.y, currentParams);
      const error = prob - point.label;
      
      gradW1 += error * point.x;
      gradW2 += error * point.y;
      gradB += error;
    });

    setCurrentParams(prev => ({
      w1: prev.w1 - (learningRate / points.length) * gradW1,
      w2: prev.w2 - (learningRate / points.length) * gradW2,
      b: prev.b - (learningRate / points.length) * gradB
    }));

    setGradientStep(prev => prev + 1);
  };

  // Animation loop
  useEffect(() => {
    if (animating) {
      const interval = setInterval(() => {
        performGradientStep();
      }, 50);

      // Stop when close enough or max iterations
      if (gradientStep > 500) {
        setAnimating(false);
      }

      return () => clearInterval(interval);
    }
  }, [animating, currentParams, points, gradientStep]);

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

    const xMin = 0, xMax = 10;
    const yMin = 0, yMax = 10;

    const scaleX = (x) => margin + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const scaleY = (y) => height - margin - ((y - yMin) / (yMax - yMin)) * plotHeight;
    const unscaleX = (screenX) => xMin + ((screenX - margin) / plotWidth) * (xMax - xMin);
    const unscaleY = (screenY) => yMin + ((height - margin - screenY) / plotHeight) * (yMax - yMin);

    // Draw probability heatmap (if enabled)
    if (showProbabilities && points.length >= 2) {
      const params = animating ? currentParams : optimalParams;
      const gridSize = 20;
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i / gridSize) * (xMax - xMin) + xMin;
          const y = (j / gridSize) * (yMax - yMin) + yMin;
          const prob = predict(x, y, params);
          
          const screenX = scaleX(x);
          const screenY = scaleY(y);
          const cellWidth = plotWidth / gridSize;
          const cellHeight = plotHeight / gridSize;
          
          // Color: blue (class 0) to red (class 1)
          const r = Math.floor(prob * 255);
          const b = Math.floor((1 - prob) * 255);
          ctx.fillStyle = `rgba(${r}, 100, ${b}, 0.3)`;
          ctx.fillRect(screenX, screenY, cellWidth, cellHeight);
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const x = scaleX(i);
      const y = scaleY(i);

      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText(i.toString(), x - 5, height - margin + 20);
      ctx.fillText(i.toString(), margin - 25, y + 4);
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px sans-serif';
    ctx.fillText('X₁', width - margin + 10, height - margin + 5);
    ctx.fillText('X₂', margin - 5, margin - 10);

    // Draw decision boundary
    if (showBoundary && points.length >= 2) {
      const params = animating ? currentParams : optimalParams;
      
      // Decision boundary: w1*x + w2*y + b = 0
      // Solve for y: y = -(w1*x + b) / w2
      if (Math.abs(params.w2) > 0.001) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const x1 = xMin;
        const y1 = -(params.w1 * x1 + params.b) / params.w2;
        const x2 = xMax;
        const y2 = -(params.w1 * x2 + params.b) / params.w2;

        ctx.moveTo(scaleX(x1), scaleY(y1));
        ctx.lineTo(scaleX(x2), scaleY(y2));
        ctx.stroke();

        // Label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const screenX = scaleX(midX);
        const screenY = scaleY(midY);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(screenX - 60, screenY - 25, 120, 20);
        
        ctx.fillStyle = 'rgba(6, 182, 212, 1)';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('Decision Boundary', screenX - 55, screenY - 10);
      }
    }

    // Draw points
    points.forEach((point, index) => {
      const screenX = scaleX(point.x);
      const screenY = scaleY(point.y);

      // Get prediction
      const params = animating ? currentParams : optimalParams;
      const prob = predict(point.x, point.y, params);
      const prediction = prob >= 0.5 ? 1 : 0;
      const isCorrect = prediction === point.label;

      // Point color based on true label
      const baseColor = point.label === 1 ? '#ef4444' : '#3b82f6'; // Red vs Blue
      const glowColor = point.label === 1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';

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

      // Outline (green if correct, orange if wrong)
      ctx.strokeStyle = isCorrect ? 'rgba(34, 197, 94, 0.8)' : 'rgba(251, 146, 60, 0.8)';
      ctx.lineWidth = isCorrect ? 2 : 3;
      ctx.stroke();

      // Highlight if dragging
      if (draggingIndex === index) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Show probability if enabled
      if (showProbabilities) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '10px monospace';
        const probText = prob.toFixed(2);
        ctx.fillText(probText, screenX + 10, screenY - 10);
      }
    });

    // Legend
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Class 0 (Blue)', margin, margin - 25);
    ctx.fillText('Class 1 (Red)', margin + 120, margin - 25);

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(margin - 12, margin - 20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(margin + 108, margin - 20, 5, 0, Math.PI * 2);
    ctx.fill();

    // Store scaling functions
    canvas.scaleX = scaleX;
    canvas.scaleY = scaleY;
    canvas.unscaleX = unscaleX;
    canvas.unscaleY = unscaleY;

  }, [points, showBoundary, showProbabilities, draggingIndex, animating, currentParams, optimalParams]);

  // Mouse handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

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
      const dataX = canvas.unscaleX(mouseX);
      const dataY = canvas.unscaleY(mouseY);

      if (dataX >= 0 && dataX <= 10 && dataY >= 0 && dataY <= 10) {
        setPoints([...points, { x: dataX, y: dataY, label: addingClass }]);
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
      i === draggingIndex ? { ...p, x: dataX, y: dataY } : p
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
    setCurrentParams({ w1: 0, w2: 0, b: 0 });
  };

  const loadPreset = (type) => {
    setAnimating(false);
    setGradientStep(0);
    setCurrentParams({ w1: 0, w2: 0, b: 0 });

    switch (type) {
      case 'linearly-separable':
        setPoints([
          // Class 0 (bottom-left)
          { x: 2, y: 2, label: 0 }, { x: 3, y: 2.5, label: 0 },
          { x: 2.5, y: 3, label: 0 }, { x: 3.5, y: 3.5, label: 0 },
          { x: 1.5, y: 3.5, label: 0 }, { x: 2.8, y: 4, label: 0 },
          // Class 1 (top-right)
          { x: 6, y: 6, label: 1 }, { x: 7, y: 6.5, label: 1 },
          { x: 6.5, y: 7, label: 1 }, { x: 7.5, y: 7.5, label: 1 },
          { x: 8, y: 7, label: 1 }, { x: 7.2, y: 8, label: 1 }
        ]);
        break;
      case 'overlapping':
        setPoints([
          // Class 0
          { x: 3, y: 5, label: 0 }, { x: 4, y: 5, label: 0 },
          { x: 3.5, y: 6, label: 0 }, { x: 5, y: 5.5, label: 0 },
          { x: 4.5, y: 6.5, label: 0 },
          // Class 1 (overlapping)
          { x: 5, y: 5, label: 1 }, { x: 6, y: 5, label: 1 },
          { x: 5.5, y: 6, label: 1 }, { x: 6.5, y: 5.5, label: 1 },
          { x: 5.8, y: 6.5, label: 1 }
        ]);
        break;
      case 'noisy':
        const noisyPoints = [];
        for (let i = 0; i < 20; i++) {
          const label = i < 10 ? 0 : 1;
          const baseX = label === 0 ? 3 : 7;
          const baseY = label === 0 ? 3 : 7;
          noisyPoints.push({
            x: baseX + (Math.random() - 0.5) * 3,
            y: baseY + (Math.random() - 0.5) * 3,
            label
          });
        }
        setPoints(noisyPoints);
        break;
      case 'xor':
        setPoints([
          // Class 0 (opposite corners)
          { x: 2, y: 2, label: 0 }, { x: 2.5, y: 2.5, label: 0 },
          { x: 8, y: 8, label: 0 }, { x: 7.5, y: 7.5, label: 0 },
          // Class 1 (other corners)
          { x: 2, y: 8, label: 1 }, { x: 2.5, y: 7.5, label: 1 },
          { x: 8, y: 2, label: 1 }, { x: 7.5, y: 2.5, label: 1 }
        ]);
        break;
      default:
        break;
    }
  };

  const startGradientDescent = () => {
    setCurrentParams({ w1: 0, w2: 0, b: 0 });
    setGradientStep(0);
    setAnimating(true);
  };

  // Class counts
  const class0Count = points.filter(p => p.label === 0).length;
  const class1Count = points.filter(p => p.label === 1).length;

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
        {/* Class Selector */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Add Points As</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAddingClass(0)}
              className={`p-3 rounded-lg border transition-all ${
                addingClass === 0
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🔵</div>
              <div className="text-xs font-semibold">Class 0</div>
            </button>
            <button
              onClick={() => setAddingClass(1)}
              className={`p-3 rounded-lg border transition-all ${
                addingClass === 1
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🔴</div>
              <div className="text-xs font-semibold">Class 1</div>
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Load Dataset</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'linearly-separable', name: 'Separable', icon: '✂️' },
              { id: 'overlapping', name: 'Overlap', icon: '🎯' },
              { id: 'noisy', name: 'Noisy', icon: '🎲' },
              { id: 'xor', name: 'XOR', icon: '❌' }
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
                checked={showBoundary}
                onChange={(e) => setShowBoundary(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-sm text-gray-300">Show Decision Boundary</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showProbabilities}
                onChange={(e) => setShowProbabilities(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-sm text-gray-300">Show Probabilities</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4 space-y-2">
          <button
            onClick={startGradientDescent}
            disabled={points.length < 4 || animating}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
              points.length < 4 || animating
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {animating ? '⏳ Training...' : '🎯 Animate Training'}
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
                <span className="text-gray-400">Class 0:</span>
                <span className="font-mono text-blue-400">{class0Count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Class 1:</span>
                <span className="font-mono text-red-400">{class1Count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="font-mono text-white">{points.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy:</span>
                <span className={`font-mono ${
                  accuracy >= 0.9 ? 'text-emerald-400' : 
                  accuracy >= 0.7 ? 'text-yellow-400' : 'text-orange-400'
                }`}>
                  {(accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Log Loss:</span>
                <span className="font-mono text-purple-400">{logLoss.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Gradient Descent Info */}
        {animating && (
          <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
            <h3 className="text-xs font-semibold text-purple-400 mb-2">
              Training Progress
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Iterations:</span>
                <span className="font-mono text-white">{gradientStep}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">w₁:</span>
                <span className="font-mono text-purple-400">{currentParams.w1.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">w₂:</span>
                <span className="font-mono text-purple-400">{currentParams.w2.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">b:</span>
                <span className="font-mono text-purple-400">{currentParams.b.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className={`rounded-xl border p-3 ${
          accuracy >= 0.9 
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : accuracy >= 0.7
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">
              {accuracy >= 0.9 ? '🎯' : accuracy >= 0.7 ? '📊' : '⚠️'}
            </span>
            <h3 className={`text-xs font-bold ${
              accuracy >= 0.9 ? 'text-emerald-400' : 
              accuracy >= 0.7 ? 'text-yellow-400' : 'text-orange-400'
            }`}>
              {points.length < 2 ? 'Add Data' : 
               accuracy >= 0.9 ? 'Excellent!' : 
               accuracy >= 0.7 ? 'Good' : 'Poor Separation'}
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {points.length < 2 
              ? 'Click to add points. Toggle class with buttons above!'
              : accuracy >= 0.9
              ? 'Classes are well separated. Cyan line divides them clearly.'
              : accuracy >= 0.7
              ? 'Some overlap exists. Check points with orange outlines (misclassified).'
              : 'Classes heavily overlap or non-linear. Logistic regression struggles here.'}
          </p>
        </div>
      </div>
    </div>
  );
};