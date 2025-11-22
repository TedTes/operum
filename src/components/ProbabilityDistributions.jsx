import React, { useState, useEffect, useRef } from 'react';

export const ProbabilityDistributions = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [distribution, setDistribution] = useState('normal'); // 'normal', 'binomial', 'poisson', 'exponential', 'uniform'
  const [param1, setParam1] = useState(0); // Mean for normal, n for binomial, λ for poisson
  const [param2, setParam2] = useState(1); // Std dev for normal, p for binomial
  const [showPDF, setShowPDF] = useState(true);
  const [showCDF, setShowCDF] = useState(false);
  const [sampleSize, setSampleSize] = useState(1000);
  const [samples, setSamples] = useState([]);
  const [showSamples, setShowSamples] = useState(false);

  // Distribution definitions
  const distributions = {
    normal: {
      name: 'Normal (Gaussian)',
      params: [
        { name: 'Mean (μ)', min: -5, max: 5, default: 0, step: 0.1 },
        { name: 'Std Dev (σ)', min: 0.1, max: 3, default: 1, step: 0.1 }
      ],
      pdf: (x, mu, sigma) => {
        const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
        const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
        return coefficient * Math.exp(exponent);
      },
      cdf: (x, mu, sigma) => {
        // Approximate using error function
        return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
      },
      sample: (mu, sigma) => {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mu + sigma * z;
      },
      range: { min: -10, max: 10 },
      description: 'Bell curve - models natural phenomena, Central Limit Theorem'
    },
    binomial: {
      name: 'Binomial',
      params: [
        { name: 'Trials (n)', min: 1, max: 50, default: 20, step: 1 },
        { name: 'Success Prob (p)', min: 0.01, max: 0.99, default: 0.5, step: 0.01 }
      ],
      pdf: (k, n, p) => {
        // Only for integer k
        if (k < 0 || k > n || k !== Math.floor(k)) return 0;
        return binomialCoef(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      },
      cdf: (x, n, p) => {
        let sum = 0;
        for (let k = 0; k <= Math.floor(x) && k <= n; k++) {
          sum += binomialCoef(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        }
        return sum;
      },
      sample: (n, p) => {
        let successes = 0;
        for (let i = 0; i < n; i++) {
          if (Math.random() < p) successes++;
        }
        return successes;
      },
      range: { min: 0, max: 50 },
      description: 'Coin flips - number of successes in n trials'
    },
    poisson: {
      name: 'Poisson',
      params: [
        { name: 'Rate (λ)', min: 0.1, max: 10, default: 3, step: 0.1 },
        { name: 'N/A', min: 0, max: 1, default: 0, step: 1 } // Dummy param
      ],
      pdf: (k, lambda) => {
        if (k < 0 || k !== Math.floor(k)) return 0;
        return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
      },
      cdf: (x, lambda) => {
        let sum = 0;
        for (let k = 0; k <= Math.floor(x); k++) {
          sum += (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
        }
        return sum;
      },
      sample: (lambda) => {
        // Knuth algorithm
        let L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
          k++;
          p *= Math.random();
        } while (p > L);
        return k - 1;
      },
      range: { min: 0, max: 20 },
      description: 'Rare events - number of occurrences in a fixed interval'
    },
    exponential: {
      name: 'Exponential',
      params: [
        { name: 'Rate (λ)', min: 0.1, max: 3, default: 1, step: 0.1 },
        { name: 'N/A', min: 0, max: 1, default: 0, step: 1 } // Dummy param
      ],
      pdf: (x, lambda) => {
        if (x < 0) return 0;
        return lambda * Math.exp(-lambda * x);
      },
      cdf: (x, lambda) => {
        if (x < 0) return 0;
        return 1 - Math.exp(-lambda * x);
      },
      sample: (lambda) => {
        return -Math.log(Math.random()) / lambda;
      },
      range: { min: 0, max: 10 },
      description: 'Waiting times - time between events in Poisson process'
    },
    uniform: {
      name: 'Uniform',
      params: [
        { name: 'Min (a)', min: -5, max: 5, default: 0, step: 0.1 },
        { name: 'Max (b)', min: -5, max: 10, default: 5, step: 0.1 }
      ],
      pdf: (x, a, b) => {
        if (x < a || x > b) return 0;
        return 1 / (b - a);
      },
      cdf: (x, a, b) => {
        if (x < a) return 0;
        if (x > b) return 1;
        return (x - a) / (b - a);
      },
      sample: (a, b) => {
        return a + Math.random() * (b - a);
      },
      range: { min: -6, max: 11 },
      description: 'Equal probability - all values equally likely'
    }
  };

  // Helper functions
  const factorial = (n) => {
    if (n <= 1) return 1;
    if (n > 20) return Infinity; // Prevent overflow
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const binomialCoef = (n, k) => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    return factorial(n) / (factorial(k) * factorial(n - k));
  };

  const erf = (x) => {
    // Approximation of error function
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  const currentDist = distributions[distribution];

  // Generate samples
  const generateSamples = () => {
    const newSamples = [];
    for (let i = 0; i < sampleSize; i++) {
      newSamples.push(currentDist.sample(param1, param2));
    }
    setSamples(newSamples);
  };

  useEffect(() => {
    if (showSamples) {
      generateSamples();
    }
  }, [distribution, param1, param2, sampleSize, showSamples]);

  // Reset params when distribution changes
  useEffect(() => {
    setParam1(currentDist.params[0].default);
    setParam2(currentDist.params[1].default);
    setSamples([]);
  }, [distribution]);

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

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * graphWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
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

    const xMin = currentDist.range.min;
    const xMax = currentDist.range.max;
    const xRange = xMax - xMin;

    // Calculate max y for scaling
    let maxY = 0;
    const step = xRange / 200;
    for (let x = xMin; x <= xMax; x += step) {
      const y = currentDist.pdf(x, param1, param2);
      if (isFinite(y) && y > maxY) maxY = y;
    }
    maxY *= 1.1; // Add 10% padding

    // Draw histogram of samples if enabled
    if (showSamples && samples.length > 0) {
      const bins = 40;
      const binWidth = xRange / bins;
      const histogram = new Array(bins).fill(0);

      samples.forEach(sample => {
        const binIndex = Math.floor((sample - xMin) / binWidth);
        if (binIndex >= 0 && binIndex < bins) {
          histogram[binIndex]++;
        }
      });

      const maxCount = Math.max(...histogram);

      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
      histogram.forEach((count, i) => {
        const x1 = padding + (i / bins) * graphWidth;
        const x2 = padding + ((i + 1) / bins) * graphWidth;
        const barHeight = (count / maxCount) * maxY;
        const y = height - padding - (barHeight / maxY) * graphHeight;
        const barWidth = x2 - x1;
        ctx.fillRect(x1, y, barWidth, height - padding - y);
      });

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, padding, graphWidth, graphHeight);
    }

    // Draw PDF
    if (showPDF) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
      ctx.beginPath();

      let started = false;
      for (let x = xMin; x <= xMax; x += step) {
        const y = currentDist.pdf(x, param1, param2);
        if (isFinite(y)) {
          const screenX = padding + ((x - xMin) / xRange) * graphWidth;
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
    }

    // Draw CDF
    if (showCDF) {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
      ctx.beginPath();

      let started = false;
      for (let x = xMin; x <= xMax; x += step) {
        const y = currentDist.cdf(x, param1, param2);
        if (isFinite(y)) {
          const screenX = padding + ((x - xMin) / xRange) * graphWidth;
          const screenY = height - padding - y * graphHeight;

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
    }

    // Labels
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * graphWidth;
      const value = xMin + (i / 5) * xRange;
      ctx.fillText(value.toFixed(1), x, height - padding + 20);
    }

    // Y-axis label (PDF)
    ctx.save();
    ctx.translate(padding - 40, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(showCDF ? 'Probability / CDF' : 'Probability Density', 0, 0);
    ctx.restore();

    // X-axis label
    ctx.fillText('Value (x)', width / 2, height - 10);

  }, [distribution, param1, param2, showPDF, showCDF, samples, showSamples]);

  // Calculate statistics from samples
  const getStatistics = () => {
    if (samples.length === 0) return null;

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);
    const sortedSamples = [...samples].sort((a, b) => a - b);
    const median = sortedSamples[Math.floor(samples.length / 2)];

    return { mean, stdDev, median, min: sortedSamples[0], max: sortedSamples[samples.length - 1] };
  };

  const stats = getStatistics();

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

            {/* Distribution Info */}
            <div className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                About: {currentDist.name}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {currentDist.description}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Distribution Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Distribution Type
              </label>
              <select
                value={distribution}
                onChange={(e) => setDistribution(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                {Object.entries(distributions).map(([key, dist]) => (
                  <option key={key} value={key} className="bg-slate-900">
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Parameter 1 */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                {currentDist.params[0].name}: {param1.toFixed(2)}
              </label>
              <input
                type="range"
                min={currentDist.params[0].min}
                max={currentDist.params[0].max}
                step={currentDist.params[0].step}
                value={param1}
                onChange={(e) => setParam1(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Parameter 2 (if not dummy) */}
            {currentDist.params[1].name !== 'N/A' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  {currentDist.params[1].name}: {param2.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={currentDist.params[1].min}
                  max={currentDist.params[1].max}
                  step={currentDist.params[1].step}
                  value={param2}
                  onChange={(e) => setParam2(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}

            {/* Display Toggles */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPDF}
                  onChange={(e) => setShowPDF(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-sm text-gray-300">Show PDF</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCDF}
                  onChange={(e) => setShowCDF(e.target.checked)}
                  className="w-4 h-4 rounded accent-pink-500"
                />
                <span className="text-sm text-gray-300">Show CDF</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSamples}
                  onChange={(e) => setShowSamples(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500"
                />
                <span className="text-sm text-gray-300">Show Samples</span>
              </label>
            </div>

            {/* Sample Size Control */}
            {showSamples && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Sample Size: {sampleSize}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <button
                  onClick={generateSamples}
                  className="w-full mt-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm font-semibold transition-all"
                >
                  Regenerate Samples
                </button>
              </div>
            )}

            {/* Statistics */}
            {stats && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">
                  Sample Statistics (n={samples.length})
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mean:</span>
                    <span className="font-mono text-cyan-400">{stats.mean.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Std Dev:</span>
                    <span className="font-mono text-purple-400">{stats.stdDev.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Median:</span>
                    <span className="font-mono text-pink-400">{stats.median.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Range:</span>
                    <span className="font-mono text-white">[{stats.min.toFixed(2)}, {stats.max.toFixed(2)}]</span>
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
                {showPDF && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-purple-500 rounded shadow-glow"></div>
                    <span className="text-gray-400">PDF (Probability Density)</span>
                  </div>
                )}
                {showCDF && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-pink-500 rounded"></div>
                    <span className="text-gray-400">CDF (Cumulative)</span>
                  </div>
                )}
                {showSamples && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-cyan-500/30 border border-cyan-500 rounded"></div>
                    <span className="text-gray-400">Sample Histogram</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">💡</span>
                <h3 className="text-xs font-bold text-cyan-400">
                  Quick Tip
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                PDF shows the likelihood of values. CDF shows cumulative probability (area under PDF). Samples demonstrate how the distribution appears in practice!
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