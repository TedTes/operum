import React, { useState, useEffect, useRef } from 'react';

export const BayesianInference = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [priorType, setPriorType] = useState('uniform'); // 'uniform', 'informative', 'skeptical'
  const [observations, setObservations] = useState([]);
  const [showPrior, setShowPrior] = useState(true);
  const [showLikelihood, setShowLikelihood] = useState(true);
  const [showPosterior, setShowPosterior] = useState(true);
  const [trueP, setTrueP] = useState(0.7); // True underlying probability (hidden from user initially)

  // Prior distributions (Beta distribution parameters)
  const priors = {
    uniform: {
      name: 'Uniform (Uninformed)',
      alpha: 1,
      beta: 1,
      description: 'No prior knowledge - all probabilities equally likely'
    },
    informative: {
      name: 'Informative Prior',
      alpha: 7,
      beta: 3,
      description: 'Strong belief that success rate is around 70%'
    },
    skeptical: {
      name: 'Skeptical Prior',
      alpha: 2,
      beta: 8,
      description: 'Belief that success rate is low (around 20%)'
    }
  };

  const currentPrior = priors[priorType];

  // Beta distribution PDF
  const betaPDF = (x, alpha, beta) => {
    if (x <= 0 || x >= 1) return 0;
    
    // Using logarithms to avoid overflow
    const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
    const logPDF = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta;
    
    return Math.exp(logPDF);
  };

  // Log-gamma function (Stirling approximation for large values)
  const logGamma = (z) => {
    if (z < 1) return logGamma(z + 1) - Math.log(z);
    if (z < 12) {
      // Use tabulated values and interpolation for small z
      return Math.log(gamma(z));
    }
    // Stirling's approximation for large z
    return (z - 0.5) * Math.log(z) - z + 0.5 * Math.log(2 * Math.PI);
  };

  // Gamma function for small values
  const gamma = (z) => {
    if (z === 1) return 1;
    if (z === 0.5) return Math.sqrt(Math.PI);
    
    // Lanczos approximation
    const g = 7;
    const c = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];

    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }

    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (z + i);
    }

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  };

  // Calculate posterior parameters
  const getPosterior = () => {
    const successes = observations.filter(o => o === 1).length;
    const failures = observations.filter(o => o === 0).length;
    
    return {
      alpha: currentPrior.alpha + successes,
      beta: currentPrior.beta + failures,
      successes,
      failures
    };
  };

  // Generate a random observation from true distribution
  const addObservation = () => {
    const success = Math.random() < trueP ? 1 : 0;
    setObservations([...observations, success]);
  };

  // Add multiple observations
  const addMultipleObservations = (n) => {
    const newObs = [];
    for (let i = 0; i < n; i++) {
      newObs.push(Math.random() < trueP ? 1 : 0);
    }
    setObservations([...observations, ...newObs]);
  };

  // Reset
  const handleReset = () => {
    setObservations([]);
  };

  // Change true probability (for demonstration)
  const handleChangeTrueP = (newP) => {
    setTrueP(newP);
    setObservations([]); // Reset observations when changing true p
  };

  const posterior = getPosterior();

  // Calculate statistics
  const getPosteriorStats = () => {
    const alpha = posterior.alpha;
    const beta = posterior.beta;
    const mean = alpha / (alpha + beta);
    const mode = alpha > 1 && beta > 1 ? (alpha - 1) / (alpha + beta - 2) : null;
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    
    // 95% credible interval (approximate using normal approximation for large alpha + beta)
    const total = alpha + beta;
    const z = 1.96; // 95% confidence
    const lower = Math.max(0, mean - z * stdDev);
    const upper = Math.min(1, mean + z * stdDev);
    
    return { mean, mode, stdDev, lower, upper };
  };

  const stats = getPosteriorStats();

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * graphWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Find max y for scaling
    let maxY = 0;
    const step = 0.005;
    for (let p = step; p < 1; p += step) {
      if (showPrior) {
        const priorY = betaPDF(p, currentPrior.alpha, currentPrior.beta);
        if (isFinite(priorY)) maxY = Math.max(maxY, priorY);
      }
      if (showPosterior && observations.length > 0) {
        const postY = betaPDF(p, posterior.alpha, posterior.beta);
        if (isFinite(postY)) maxY = Math.max(maxY, postY);
      }
    }
    maxY *= 1.1;

    // Draw Prior
    if (showPrior) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      let started = false;
      for (let p = step; p < 1; p += step) {
        const y = betaPDF(p, currentPrior.alpha, currentPrior.beta);
        if (isFinite(y)) {
          const screenX = padding + p * graphWidth;
          const screenY = height - padding - (y / maxY) * graphHeight;

          if (!started) {
            ctx.moveTo(screenX, screenY);
            started = true;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Posterior
    if (showPosterior && observations.length > 0) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
      ctx.beginPath();

      let started = false;
      for (let p = step; p < 1; p += step) {
        const y = betaPDF(p, posterior.alpha, posterior.beta);
        if (isFinite(y)) {
          const screenX = padding + p * graphWidth;
          const screenY = height - padding - (y / maxY) * graphHeight;

          if (!started) {
            ctx.moveTo(screenX, screenY);
            started = true;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw mean line
      const meanX = padding + stats.mean * graphWidth;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(meanX, padding);
      ctx.lineTo(meanX, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label mean
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Mean: ${stats.mean.toFixed(3)}`, meanX + 5, padding + 20);

      // Draw 95% credible interval
      const lowerX = padding + stats.lower * graphWidth;
      const upperX = padding + stats.upper * graphWidth;
      
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.fillRect(lowerX, padding, upperX - lowerX, graphHeight);
      
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(lowerX, padding, upperX - lowerX, graphHeight);
    }

    // Draw true value line (hidden initially, revealed after observations)
    if (observations.length > 5) {
      const trueX = padding + trueP * graphWidth;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(trueX, padding);
      ctx.lineTo(trueX, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`True: ${trueP.toFixed(2)}`, trueX + 5, padding + 40);
    }

    // Labels
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * graphWidth;
      ctx.fillText((i / 10).toFixed(1), x, height - padding + 20);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(padding - 40, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Probability Density', 0, 0);
    ctx.restore();

    // X-axis label
    ctx.fillText('Parameter θ (Success Probability)', width / 2, height - 10);

  }, [priorType, observations, showPrior, showPosterior, trueP]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-3 md:p-4">
              <canvas
                ref={canvasRef}
                width={700}
                height={450}
                className="w-full rounded-lg"
              />
            </div>

            {/* Bayes' Theorem */}
            <div className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Bayes' Theorem
              </h3>
              <div className="text-center font-mono text-sm">
                <div className="text-purple-400 mb-2">
                  Posterior ∝ Likelihood × Prior
                </div>
                <div className="text-xs text-gray-400">
                  P(θ|Data) ∝ P(Data|θ) × P(θ)
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {observations.length > 0 
                    ? `Beta(${posterior.alpha}, ${posterior.beta}) ← ${posterior.successes} successes, ${posterior.failures} failures`
                    : `Starting with ${currentPrior.name}: Beta(${currentPrior.alpha}, ${currentPrior.beta})`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Prior Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Choose Prior Belief
              </label>
              <div className="space-y-2">
                {Object.entries(priors).map(([key, prior]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPriorType(key);
                      setObservations([]);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      priorType === key
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="font-semibold">{prior.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{prior.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Observation Buttons */}
            <div className="space-y-2">
              <button
                onClick={addObservation}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-sm"
              >
                Add 1 Observation
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addMultipleObservations(10)}
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm font-semibold transition-all"
                >
                  Add 10
                </button>
                <button
                  onClick={() => addMultipleObservations(100)}
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm font-semibold transition-all"
                >
                  Add 100
                </button>
              </div>
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 text-sm"
              >
                Reset Observations
              </button>
            </div>

            {/* True Probability Control (Hidden Feature) */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                True Success Rate (Hidden): {trueP.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={trueP}
                onChange={(e) => handleChangeTrueP(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">
                Change the true underlying probability
              </p>
            </div>

            {/* Display Toggles */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrior}
                  onChange={(e) => setShowPrior(e.target.checked)}
                  className="w-4 h-4 rounded accent-gray-500"
                />
                <span className="text-sm text-gray-300">Show Prior (dashed)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPosterior}
                  onChange={(e) => setShowPosterior(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-sm text-gray-300">Show Posterior (solid)</span>
              </label>
            </div>

            {/* Observations Summary */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Observations (n={observations.length})
              </h3>
              {observations.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Successes:</span>
                    <span className="font-mono text-emerald-400">{posterior.successes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Failures:</span>
                    <span className="font-mono text-red-400">{posterior.failures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sample Rate:</span>
                    <span className="font-mono text-white">
                      {(posterior.successes / observations.length).toFixed(3)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No observations yet</p>
              )}
            </div>

            {/* Posterior Statistics */}
            {observations.length > 0 && (
              <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-3">
                <h3 className="text-xs font-semibold text-purple-400 mb-2">
                  Posterior Statistics
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mean (Best Estimate):</span>
                    <span className="font-mono text-cyan-400">{stats.mean.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Std Dev:</span>
                    <span className="font-mono text-purple-400">{stats.stdDev.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">95% Credible Interval:</span>
                    <span className="font-mono text-white">
                      [{stats.lower.toFixed(3)}, {stats.upper.toFixed(3)}]
                    </span>
                  </div>
                  {observations.length > 5 && (
                    <div className="flex justify-between pt-1.5 border-t border-white/10">
                      <span className="text-gray-400">Distance from True:</span>
                      <span className="font-mono text-emerald-400">
                        {Math.abs(stats.mean - trueP).toFixed(3)}
                      </span>
                    </div>
                  )}
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
                  <div className="w-6 h-1 bg-gray-500 rounded" style={{ borderStyle: 'dashed', borderWidth: '1px' }}></div>
                  <span className="text-gray-400">Prior belief</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-purple-500 rounded shadow-glow"></div>
                  <span className="text-gray-400">Posterior (updated belief)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-cyan-500 rounded" style={{ borderStyle: 'dashed', borderWidth: '1px' }}></div>
                  <span className="text-gray-400">Posterior mean</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-purple-500/20 border border-purple-500/50 rounded"></div>
                  <span className="text-gray-400">95% credible interval</span>
                </div>
                {observations.length > 5 && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-emerald-500 rounded" style={{ borderStyle: 'dashed', borderWidth: '1px' }}></div>
                    <span className="text-gray-400">True value (revealed)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">💡</span>
                <h3 className="text-xs font-bold text-cyan-400">
                  How It Works
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Start with a prior belief (uniform, informative, or skeptical). Add observations to see how the posterior evolves. More data = narrower distribution = more certainty!
              </p>
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