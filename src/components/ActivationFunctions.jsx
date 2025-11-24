import React, { useState, useEffect, useRef } from 'react';

export const ActivationFunctions = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [selectedFunction, setSelectedFunction] = useState('relu');
  const [showDerivative, setShowDerivative] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [inputValue, setInputValue] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Activation functions
  const activationFunctions = {
    relu: {
      name: 'ReLU',
      fullName: 'Rectified Linear Unit',
      fn: (x) => Math.max(0, x),
      derivative: (x) => x > 0 ? 1 : 0,
      color: '#22c55e',
      description: 'Most popular. Fast, simple, no vanishing gradient for x > 0.',
      equation: 'f(x) = max(0, x)',
      pros: ['Fast computation', 'No vanishing gradient (x > 0)', 'Sparse activation'],
      cons: ['Dead neurons (x < 0)', 'Not zero-centered', 'Unbounded output']
    },
    sigmoid: {
      name: 'Sigmoid',
      fullName: 'Logistic Function',
      fn: (x) => 1 / (1 + Math.exp(-x)),
      derivative: (x) => {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      },
      color: '#3b82f6',
      description: 'Smooth, outputs [0,1]. Used in binary classification. SUFFERS vanishing gradient!',
      equation: 'f(x) = 1 / (1 + e⁻ˣ)',
      pros: ['Smooth everywhere', 'Output in [0,1]', 'Probabilistic interpretation'],
      cons: ['Vanishing gradient!', 'Not zero-centered', 'Expensive (exp)']
    },
    tanh: {
      name: 'Tanh',
      fullName: 'Hyperbolic Tangent',
      fn: (x) => Math.tanh(x),
      derivative: (x) => 1 - Math.tanh(x) ** 2,
      color: '#8b5cf6',
      description: 'Like sigmoid but outputs [-1,1]. Zero-centered. Still vanishing gradient.',
      equation: 'f(x) = tanh(x)',
      pros: ['Zero-centered', 'Output in [-1,1]', 'Smoother than ReLU'],
      cons: ['Vanishing gradient!', 'Expensive (exp)', 'Saturation']
    },
    'leaky-relu': {
      name: 'Leaky ReLU',
      fullName: 'Leaky Rectified Linear Unit',
      fn: (x) => x > 0 ? x : 0.01 * x,
      derivative: (x) => x > 0 ? 1 : 0.01,
      color: '#f59e0b',
      description: 'Fixes dead ReLU problem with small negative slope. Best of both worlds!',
      equation: 'f(x) = max(0.01x, x)',
      pros: ['No dead neurons', 'Fast like ReLU', 'No vanishing gradient'],
      cons: ['Small negative slope arbitrary', 'Not as popular as ReLU']
    },
    elu: {
      name: 'ELU',
      fullName: 'Exponential Linear Unit',
      fn: (x) => x > 0 ? x : Math.exp(x) - 1,
      derivative: (x) => x > 0 ? 1 : Math.exp(x),
      color: '#ec4899',
      description: 'Smooth everywhere. Negative saturation pushes mean toward zero.',
      equation: 'f(x) = x if x > 0, else eˣ - 1',
      pros: ['Smooth', 'Zero-centered outputs', 'No dead neurons'],
      cons: ['Expensive (exp)', 'Saturation for negative']
    },
    swish: {
      name: 'Swish',
      fullName: 'Self-Gated Activation',
      fn: (x) => x / (1 + Math.exp(-x)),
      derivative: (x) => {
        const s = 1 / (1 + Math.exp(-x));
        return s + x * s * (1 - s);
      },
      color: '#06b6d4',
      description: 'Smooth, non-monotonic. Outperforms ReLU in deep networks (discovered by Google).',
      equation: 'f(x) = x · σ(x)',
      pros: ['Smooth everywhere', 'Outperforms ReLU', 'Self-gated'],
      cons: ['More expensive', 'Not interpretable', 'Relatively new']
    }
  };

  const currentFunc = activationFunctions[selectedFunction];

  // Animation
  useEffect(() => {
    if (animating) {
      const interval = setInterval(() => {
        setAnimationStep(prev => {
          const next = prev + 0.05;
          if (next > Math.PI * 2) {
            setAnimating(false);
            return 0;
          }
          return next;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [animating]);

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

    const margin = 60;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;
    const centerX = width / 2;
    const centerY = height / 2;

    // Axis range
    const xMin = -6;
    const xMax = 6;
    const yMin = -2;
    const yMax = 2;

    const scaleX = (x) => centerX + (x / (xMax - xMin)) * plotWidth;
    const scaleY = (y) => centerY - (y / (yMax - yMin)) * plotHeight;

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      if (x === 0) continue;
      ctx.beginPath();
      ctx.moveTo(scaleX(x), scaleY(yMin));
      ctx.lineTo(scaleX(x), scaleY(yMax));
      ctx.stroke();
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      if (y === 0) continue;
      ctx.beginPath();
      ctx.moveTo(scaleX(xMin), scaleY(y));
      ctx.lineTo(scaleX(xMax), scaleY(y));
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(scaleX(xMin), scaleY(0));
    ctx.lineTo(scaleX(xMax), scaleY(0));
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(scaleX(0), scaleY(yMin));
    ctx.lineTo(scaleX(0), scaleY(yMax));
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText('x (input)', scaleX(xMax) - 60, scaleY(0) - 10);
    ctx.fillText('f(x)', scaleX(0) + 10, scaleY(yMax) + 20);

    // Draw tick marks and labels
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    
    for (let x = -5; x <= 5; x++) {
      if (x === 0) continue;
      ctx.fillText(x.toString(), scaleX(x) - 5, scaleY(0) + 20);
    }
    
    for (let y = -1; y <= 1; y++) {
      if (y === 0) continue;
      ctx.fillText(y.toFixed(1), scaleX(0) + 10, scaleY(y) + 5);
    }

    // Helper function to draw a function
    const drawFunction = (func, color, lineWidth = 3, label = null) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      let started = false;
      for (let x = xMin; x <= xMax; x += 0.02) {
        const y = func(x);
        if (y < yMin || y > yMax) continue;

        const screenX = scaleX(x);
        const screenY = scaleY(y);

        if (!started) {
          ctx.moveTo(screenX, screenY);
          started = true;
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      ctx.stroke();

      // Label
      if (label) {
        const labelX = scaleX(4);
        const labelY = scaleY(func(4));
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(labelX + 5, labelY - 15, 100, 20);
        
        ctx.fillStyle = color;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(label, labelX + 10, labelY);
      }
    };

    // Draw all functions or just selected
    if (showAll) {
      Object.entries(activationFunctions).forEach(([key, func]) => {
        const alpha = key === selectedFunction ? '1' : '0.4';
        const color = func.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(');
        drawFunction(
          showDerivative ? func.derivative : func.fn,
          func.color,
          key === selectedFunction ? 3 : 2,
          func.name
        );
      });
    } else {
      drawFunction(
        showDerivative ? currentFunc.derivative : currentFunc.fn,
        currentFunc.color,
        3,
        currentFunc.name
      );
    }

    // Draw input marker if not animating
    if (!animating && !showAll) {
      const outputY = showDerivative ? currentFunc.derivative(inputValue) : currentFunc.fn(inputValue);
      
      // Vertical line from x-axis to point
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(scaleX(inputValue), scaleY(0));
      ctx.lineTo(scaleX(inputValue), scaleY(outputY));
      ctx.stroke();

      // Horizontal line from y-axis to point
      ctx.beginPath();
      ctx.moveTo(scaleX(0), scaleY(outputY));
      ctx.lineTo(scaleX(inputValue), scaleY(outputY));
      ctx.stroke();
      ctx.setLineDash([]);

      // Point
      ctx.fillStyle = currentFunc.color;
      ctx.beginPath();
      ctx.arc(scaleX(inputValue), scaleY(outputY), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`x = ${inputValue.toFixed(2)}`, scaleX(inputValue) - 30, scaleY(0) + 35);
      ctx.fillText(`y = ${outputY.toFixed(3)}`, scaleX(0) - 70, scaleY(outputY) + 5);
    }

    // Animate signal propagation
    if (animating) {
      const x = -6 + (animationStep / (Math.PI * 2)) * 12;
      const y = showDerivative ? currentFunc.derivative(x) : currentFunc.fn(x);

      if (y >= yMin && y <= yMax) {
        // Trail
        ctx.strokeStyle = currentFunc.color + '60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = -1; i >= -0.5; i -= 0.05) {
          const trailX = x + i;
          if (trailX < xMin) continue;
          const trailY = showDerivative ? currentFunc.derivative(trailX) : currentFunc.fn(trailX);
          if (trailY < yMin || trailY > yMax) continue;
          
          if (i === -1) ctx.moveTo(scaleX(trailX), scaleY(trailY));
          else ctx.lineTo(scaleX(trailX), scaleY(trailY));
        }
        ctx.stroke();

        // Moving point
        ctx.fillStyle = currentFunc.color;
        ctx.beginPath();
        ctx.arc(scaleX(x), scaleY(y), 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow
        ctx.fillStyle = currentFunc.color + '40';
        ctx.beginPath();
        ctx.arc(scaleX(x), scaleY(y), 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px sans-serif';
    const title = showDerivative ? 'Derivative f\'(x)' : 'Activation Function f(x)';
    ctx.fillText(title, margin, margin - 30);

    // Equation
    ctx.font = '13px monospace';
    ctx.fillStyle = currentFunc.color;
    ctx.fillText(currentFunc.equation, margin, margin - 10);

  }, [selectedFunction, showDerivative, showAll, inputValue, animating, animationStep]);

  const handleStartAnimation = () => {
    setAnimationStep(0);
    setAnimating(true);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={700}
          className="max-w-full h-auto"
        />
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Function Selector */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Activation Function</h3>
          <div className="space-y-2">
            {Object.entries(activationFunctions).map(([key, func]) => (
              <button
                key={key}
                onClick={() => setSelectedFunction(key)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedFunction === key
                    ? 'border-2 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
                style={{
                  borderColor: selectedFunction === key ? func.color : undefined,
                  backgroundColor: selectedFunction === key ? func.color + '20' : undefined
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: func.color }}
                  />
                  <span className="font-semibold text-sm">{func.name}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {func.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Display Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showDerivative}
                onChange={(e) => setShowDerivative(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-sm text-gray-300">Show Derivative f'(x)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-sm text-gray-300">Compare All Functions</span>
            </label>
          </div>
        </div>

        {/* Input Value Slider */}
        {!animating && !showAll && (
          <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Input Value (x)</h3>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.1"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>-6</span>
              <span className="text-cyan-400 font-mono text-sm">{inputValue.toFixed(1)}</span>
              <span>+6</span>
            </div>
            <div className="mt-3 p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">f(x) =</span>
                <span className="font-mono text-white">
                  {(showDerivative ? currentFunc.derivative(inputValue) : currentFunc.fn(inputValue)).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Animation Control */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <button
            onClick={handleStartAnimation}
            disabled={animating}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {animating ? '⚡ Propagating...' : '🎬 Animate Signal'}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Watch a signal propagate through the function
          </p>
        </div>

        {/* Function Properties */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Properties</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 mb-1">Pros ✓</h4>
              <ul className="space-y-1">
                {currentFunc.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-red-400 mb-1">Cons ✗</h4>
              <ul className="space-y-1">
                {currentFunc.cons.map((con, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div 
          className="rounded-xl border p-3"
          style={{
            backgroundColor: currentFunc.color + '10',
            borderColor: currentFunc.color + '30'
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className="text-xs font-bold" style={{ color: currentFunc.color }}>
              When to Use {currentFunc.name}?
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {selectedFunction === 'relu' && 'Default choice for hidden layers. Fast and effective. Use unless you have a reason not to.'}
            {selectedFunction === 'sigmoid' && 'Output layer for binary classification. Gives probabilities [0,1]. Avoid in hidden layers (vanishing gradient).'}
            {selectedFunction === 'tanh' && 'Hidden layers when zero-centered outputs matter. Better than sigmoid but still saturates. Try ReLU first.'}
            {selectedFunction === 'leaky-relu' && 'When ReLU neurons die. Small negative slope prevents dead neurons. Good alternative to ReLU.'}
            {selectedFunction === 'elu' && 'When you want smooth negative values. Pushes mean activations toward zero. Slower than ReLU.'}
            {selectedFunction === 'swish' && 'Deep networks (10+ layers). Can outperform ReLU. Discovered by Google via neural architecture search.'}
          </p>
        </div>

        {/* Vanishing Gradient Warning */}
        {(selectedFunction === 'sigmoid' || selectedFunction === 'tanh') && showDerivative && (
          <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">⚠️</span>
              <h3 className="text-xs font-bold text-red-400">
                Vanishing Gradient Problem!
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Notice how f'(x) → 0 for large |x|? This kills gradients in backpropagation! Deep networks can't learn. This is why ReLU became popular.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};