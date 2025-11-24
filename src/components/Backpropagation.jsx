import React, { useState, useEffect, useRef } from 'react';

export const Backpropagation = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showGradients, setShowGradients] = useState(true);
  const [showValues, setShowValues] = useState(true);

  // Simple 3-layer network: 2 → 2 → 1
  const network = {
    layers: [2, 2, 1],
    weights: [
      [[0.5, -0.3], [0.8, 0.2]], // Layer 0→1 weights
      [[0.6], [-0.4]]             // Layer 1→2 weights
    ],
    biases: [
      [0.1, -0.2],  // Layer 1 biases
      [0.3]          // Layer 2 biases
    ]
  };

  // Example input and target
  const input = [0.5, 0.8];
  const target = 1.0;
  const learningRate = 0.1;

  // Activation functions
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const sigmoidDerivative = (x) => {
    const s = sigmoid(x);
    return s * (1 - s);
  };

  // Forward pass calculations
  const calculateForward = () => {
    // Layer 1 (hidden)
    const z1 = [
      input[0] * network.weights[0][0][0] + input[1] * network.weights[0][0][1] + network.biases[0][0],
      input[0] * network.weights[0][1][0] + input[1] * network.weights[0][1][1] + network.biases[0][1]
    ];
    const a1 = z1.map(sigmoid);

    // Layer 2 (output)
    const z2 = [
      a1[0] * network.weights[1][0][0] + a1[1] * network.weights[1][1][0] + network.biases[1][0]
    ];
    const a2 = z2.map(sigmoid);

    // Loss (MSE)
    const loss = 0.5 * Math.pow(a2[0] - target, 2);

    return { z1, a1, z2, a2, loss };
  };

  // Backward pass calculations
  const calculateBackward = () => {
    const { z1, a1, z2, a2 } = calculateForward();

    // Output layer gradient
    const dLoss_da2 = a2[0] - target;
    const da2_dz2 = sigmoidDerivative(z2[0]);
    const dLoss_dz2 = dLoss_da2 * da2_dz2;

    // Output layer weight gradients
    const dz2_dw2 = [a1[0], a1[1]];
    const dLoss_dw2 = dz2_dw2.map(x => dLoss_dz2 * x);
    const dLoss_db2 = dLoss_dz2;

    // Hidden layer gradients
    const dz2_da1 = [network.weights[1][0][0], network.weights[1][1][0]];
    const dLoss_da1 = dz2_da1.map(x => dLoss_dz2 * x);
    const da1_dz1 = z1.map(sigmoidDerivative);
    const dLoss_dz1 = dLoss_da1.map((x, i) => x * da1_dz1[i]);

    // Hidden layer weight gradients
    const dLoss_dw1 = [
      [dLoss_dz1[0] * input[0], dLoss_dz1[0] * input[1]],
      [dLoss_dz1[1] * input[0], dLoss_dz1[1] * input[1]]
    ];
    const dLoss_db1 = dLoss_dz1;

    return {
      dLoss_dz2, dLoss_dw2, dLoss_db2,
      dLoss_dz1, dLoss_dw1, dLoss_db1,
      dLoss_da1
    };
  };

  const forward = calculateForward();
  const backward = calculateBackward();

  // Animation steps
  const totalSteps = 12;
  const stepDescriptions = [
    { title: 'Input Layer', desc: 'Feed input values [0.5, 0.8] into the network' },
    { title: 'Hidden Layer - Compute z', desc: 'Calculate weighted sum: z = Wx + b' },
    { title: 'Hidden Layer - Activation', desc: 'Apply sigmoid: a = σ(z)' },
    { title: 'Output Layer - Compute z', desc: 'Calculate weighted sum for output' },
    { title: 'Output Layer - Activation', desc: 'Apply sigmoid to get prediction' },
    { title: 'Calculate Loss', desc: `Loss = 0.5(prediction - target)² = ${forward.loss.toFixed(4)}` },
    { title: 'Output Gradient', desc: 'Compute ∂L/∂z for output layer' },
    { title: 'Output Weight Gradients', desc: 'Compute ∂L/∂w for output weights' },
    { title: 'Backprop to Hidden', desc: 'Flow gradients back to hidden layer' },
    { title: 'Hidden Layer Gradients', desc: 'Compute ∂L/∂z for hidden neurons' },
    { title: 'Hidden Weight Gradients', desc: 'Compute ∂L/∂w for hidden weights' },
    { title: 'Update Weights', desc: 'Apply gradients: w = w - α·∂L/∂w' }
  ];

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed]);

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

    const layerX = [100, 300, 500];
    const neuronY = {
      0: [height / 2 - 40, height / 2 + 40],
      1: [height / 2 - 40, height / 2 + 40],
      2: [height / 2]
    };

    const neuronRadius = 25;

    // Helper to check if step is active
    const isStepActive = (stepNum) => step >= stepNum;
    const isCurrentStep = (stepNum) => step === stepNum;

    // Draw connections with gradients
    const drawConnection = (fromLayer, fromNeuron, toLayer, toNeuron, weight, gradient = null, highlight = false) => {
      const x1 = layerX[fromLayer];
      const y1 = neuronY[fromLayer][fromNeuron];
      const x2 = layerX[toLayer];
      const y2 = neuronY[toLayer][toNeuron];

      // Connection line
      ctx.strokeStyle = highlight ? '#fbbf24' : weight > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = highlight ? 4 : Math.abs(weight) * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(x1 + neuronRadius, y1);
      ctx.lineTo(x2 - neuronRadius, y2);
      ctx.stroke();

      // Show gradient if enabled and calculated
      if (showGradients && gradient !== null && isStepActive(7)) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
        ctx.font = 'bold 11px monospace';
        const gradText = `∇${gradient.toFixed(3)}`;
        const textWidth = ctx.measureText(gradText).width;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(midX - textWidth/2 - 3, midY - 10, textWidth + 6, 16);
        
        ctx.fillStyle = '#a78bfa';
        ctx.fillText(gradText, midX - textWidth/2, midY + 2);
      }

      // Weight label
      if (showValues && isStepActive(1)) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 15;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px monospace';
        ctx.fillText(`w=${weight.toFixed(2)}`, midX - 20, midY);
      }
    };

    // Draw all connections (layer 0 → 1)
    if (isStepActive(1)) {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const gradient = isStepActive(10) ? backward.dLoss_dw1[j][i] : null;
          const highlight = isCurrentStep(10) || (isCurrentStep(8) && i === 0 && j === 0);
          drawConnection(0, i, 1, j, network.weights[0][j][i], gradient, highlight);
        }
      }
    }

    // Draw connections (layer 1 → 2)
    if (isStepActive(3)) {
      for (let i = 0; i < 2; i++) {
        const gradient = isStepActive(7) ? backward.dLoss_dw2[i] : null;
        const highlight = isCurrentStep(7) || isCurrentStep(8);
        drawConnection(1, i, 2, 0, network.weights[1][i][0], gradient, highlight);
      }
    }

    // Draw neurons
    for (let layer = 0; layer < 3; layer++) {
      const numNeurons = network.layers[layer];
      
      for (let i = 0; i < numNeurons; i++) {
        const x = layerX[layer];
        const y = neuronY[layer][i];

        // Determine if this neuron should be highlighted
        let highlight = false;
        let highlightColor = '#fbbf24';

        if (layer === 0 && isCurrentStep(0)) highlight = true;
        if (layer === 1 && (isCurrentStep(1) || isCurrentStep(2) || isCurrentStep(9))) highlight = true;
        if (layer === 2 && (isCurrentStep(3) || isCurrentStep(4) || isCurrentStep(6))) highlight = true;

        // Neuron circle
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        if (highlight) {
          ctx.strokeStyle = highlightColor;
          ctx.lineWidth = 4;
        } else {
          ctx.strokeStyle = layer === 0 ? '#3b82f6' : layer === 2 ? '#ef4444' : '#8b5cf6';
          ctx.lineWidth = 2;
        }
        ctx.stroke();

        // Glow effect if highlighted
        if (highlight) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.beginPath();
          ctx.arc(x, y, neuronRadius + 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Value inside neuron
        if (showValues && isStepActive(layer === 0 ? 0 : layer === 1 ? 2 : 4)) {
          let value = 0;
          if (layer === 0) value = input[i];
          else if (layer === 1) value = forward.a1[i];
          else if (layer === 2) value = forward.a2[i];

          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(value.toFixed(2), x, y + 4);
        }

        // Gradient label
        if (showGradients && layer > 0) {
          let gradient = null;
          if (layer === 2 && isStepActive(6)) gradient = backward.dLoss_dz2;
          if (layer === 1 && isStepActive(9)) gradient = backward.dLoss_dz1[i];

          if (gradient !== null) {
            ctx.fillStyle = '#a78bfa';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            const gradValue = typeof gradient === 'number' ? gradient : gradient;
            ctx.fillText(`∇${gradValue.toFixed(3)}`, x, y + neuronRadius + 18);
          }
        }
      }
    }

    // Layer labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Input', layerX[0], 50);
    ctx.fillText('Hidden', layerX[1], 50);
    ctx.fillText('Output', layerX[2], 50);

    // Forward/Backward arrow
    if (step <= 5) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('→ Forward Pass →', width / 2, height - 30);
    } else {
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('← Backward Pass ←', width / 2, height - 30);
    }

    // Target and loss display
    if (isStepActive(5)) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`Target: ${target.toFixed(2)}`, layerX[2] + 80, height / 2 - 10);
      ctx.fillText(`Loss: ${forward.loss.toFixed(4)}`, layerX[2] + 80, height / 2 + 10);
    }

  }, [step, showGradients, showValues, forward, backward]);

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          className="max-w-full h-auto"
        />
        
        {/* Progress bar */}
        <div className="w-full max-w-2xl mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">Step {step + 1}/{totalSteps}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Step Info */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">
            {stepDescriptions[step].title}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            {stepDescriptions[step].desc}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Playback</h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              ← Prev
            </button>
            <button
              onClick={handlePlayPause}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={handleNext}
              disabled={step === totalSteps - 1}
              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Next →
            </button>
          </div>
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-all text-sm"
          >
            🔄 Reset
          </button>
        </div>

        {/* Speed Control */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Animation Speed</h3>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span className="text-cyan-400 font-semibold">{speed}x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Display Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showGradients}
                onChange={(e) => setShowGradients(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-sm text-gray-300">Show Gradients</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-sm text-gray-300">Show Values</span>
            </label>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Network Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Architecture:</span>
              <span className="font-mono text-white">2-2-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Input:</span>
              <span className="font-mono text-cyan-400">[{input.join(', ')}]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target:</span>
              <span className="font-mono text-red-400">{target.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Prediction:</span>
              <span className="font-mono text-emerald-400">{forward.a2[0].toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Loss (MSE):</span>
              <span className="font-mono text-purple-400">{forward.loss.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Learning Rate:</span>
              <span className="font-mono text-orange-400">{learningRate}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className="text-xs font-bold text-purple-400">
              Chain Rule in Action
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Backpropagation is just the chain rule from calculus! Gradients flow backward through the network, multiplying derivatives at each layer. This tells us how to adjust weights to reduce loss.
          </p>
        </div>
      </div>
    </div>
  );
};