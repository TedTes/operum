import React, { useState, useEffect, useRef } from 'react';

export const HypothesisTesting = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [testType, setTestType] = useState('one-sample'); // 'one-sample', 'two-sample', 'paired'
  const [sampleSize, setSampleSize] = useState(30);
  const [populationMean, setPopulationMean] = useState(100);
  const [sampleMean, setSampleMean] = useState(105);
  const [stdDev, setStdDev] = useState(15);
  const [alpha, setAlpha] = useState(0.05);
  const [sample, setSample] = useState([]);
  const [showDistribution, setShowDistribution] = useState(true);
  const [showCriticalRegion, setShowCriticalRegion] = useState(true);
  const [animating, setAnimating] = useState(false);

  // Generate sample data
  const generateSample = () => {
    const newSample = [];
    for (let i = 0; i < sampleSize; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const value = sampleMean + z * stdDev;
      newSample.push(value);
    }
    return newSample;
  };

  // Generate sample on mount and when parameters change
  useEffect(() => {
    if (testType === 'one-sample') {
      setSample(generateSample());
    }
  }, [sampleSize, sampleMean, stdDev, testType]);

  // Calculate t-statistic
  const calculateTStatistic = () => {
    if (sample.length === 0) return 0;
    
    const mean = sample.reduce((sum, val) => sum + val, 0) / sample.length;
    const variance = sample.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (sample.length - 1);
    const sampleStdDev = Math.sqrt(variance);
    const standardError = sampleStdDev / Math.sqrt(sample.length);
    
    return (mean - populationMean) / standardError;
  };

  const tStatistic = calculateTStatistic();

  // Calculate p-value (two-tailed)
  const calculatePValue = () => {
    const df = sample.length - 1;
    const t = Math.abs(tStatistic);
    
    // Approximate p-value using normal distribution (good for df > 30)
    // For smaller df, this is an approximation
    const z = t;
    const p = 2 * (1 - normalCDF(z));
    
    return Math.max(0, Math.min(1, p));
  };

  // Standard normal CDF approximation
  const normalCDF = (x) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };

  const pValue = calculatePValue();

  // Critical t-value (approximate for two-tailed)
  const getCriticalValue = () => {
    // Approximation: for large df, t ≈ z
    const zCritical = {
      0.01: 2.576,
      0.05: 1.96,
      0.10: 1.645
    };
    return zCritical[alpha] || 1.96;
  };

  const criticalValue = getCriticalValue();

  // Decision
  const rejectNull = pValue < alpha;
  const sampleMeanCalc = sample.length > 0 ? sample.reduce((sum, val) => sum + val, 0) / sample.length : 0;

  // Effect size (Cohen's d)
  const calculateEffectSize = () => {
    if (sample.length === 0) return 0;
    return (sampleMeanCalc - populationMean) / stdDev;
  };

  const effectSize = calculateEffectSize();

  // Confidence interval
  const calculateConfidenceInterval = () => {
    if (sample.length === 0) return [0, 0];
    
    const mean = sampleMeanCalc;
    const variance = sample.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (sample.length - 1);
    const sampleStdDev = Math.sqrt(variance);
    const standardError = sampleStdDev / Math.sqrt(sample.length);
    const margin = criticalValue * standardError;
    
    return [mean - margin, mean + margin];
  };

  const [ciLower, ciUpper] = calculateConfidenceInterval();

  // T-distribution PDF approximation (using normal as approximation)
  const tDistributionPDF = (x) => {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  };

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
    const plotHeight = height * 0.4;

    // Distribution plot (top half)
    if (showDistribution) {
      const centerX = width / 2;
      const baseY = margin + plotHeight;

      // X-axis range for t-distribution
      const xMin = -4;
      const xMax = 4;
      const yMax = 0.5;

      const scaleX = (x) => centerX + (x / (xMax - xMin)) * plotWidth * 0.9;
      const scaleY = (y) => baseY - (y / yMax) * plotHeight * 0.8;

      // Draw axes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scaleX(xMin), baseY);
      ctx.lineTo(scaleX(xMax), baseY);
      ctx.stroke();

      // Draw t-distribution curve
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = xMin; x <= xMax; x += 0.05) {
        const y = tDistributionPDF(x);
        const screenX = scaleX(x);
        const screenY = scaleY(y);

        if (x === xMin) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // Fill critical regions (if enabled)
      if (showCriticalRegion) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        
        // Left tail
        ctx.beginPath();
        ctx.moveTo(scaleX(-criticalValue), baseY);
        for (let x = -criticalValue; x >= xMin; x -= 0.05) {
          const y = tDistributionPDF(x);
          ctx.lineTo(scaleX(x), scaleY(y));
        }
        ctx.lineTo(scaleX(xMin), baseY);
        ctx.closePath();
        ctx.fill();

        // Right tail
        ctx.beginPath();
        ctx.moveTo(scaleX(criticalValue), baseY);
        for (let x = criticalValue; x <= xMax; x += 0.05) {
          const y = tDistributionPDF(x);
          ctx.lineTo(scaleX(x), scaleY(y));
        }
        ctx.lineTo(scaleX(xMax), baseY);
        ctx.closePath();
        ctx.fill();

        // Critical value lines
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(scaleX(-criticalValue), baseY);
        ctx.lineTo(scaleX(-criticalValue), scaleY(tDistributionPDF(-criticalValue)));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(scaleX(criticalValue), baseY);
        ctx.lineTo(scaleX(criticalValue), scaleY(tDistributionPDF(criticalValue)));
        ctx.stroke();

        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = '11px monospace';
        ctx.fillText(`-${criticalValue.toFixed(2)}`, scaleX(-criticalValue) - 25, baseY + 20);
        ctx.fillText(`+${criticalValue.toFixed(2)}`, scaleX(criticalValue) - 25, baseY + 20);
      }

      // Draw test statistic line
      if (Math.abs(tStatistic) <= 4) {
        ctx.strokeStyle = rejectNull ? '#22c55e' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(scaleX(tStatistic), baseY);
        ctx.lineTo(scaleX(tStatistic), scaleY(tDistributionPDF(tStatistic)));
        ctx.stroke();

        // Label
        ctx.fillStyle = rejectNull ? '#22c55e' : '#f59e0b';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`t = ${tStatistic.toFixed(2)}`, scaleX(tStatistic) + 5, scaleY(tDistributionPDF(tStatistic)) - 10);
      }

      // Title
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Sampling Distribution (t-distribution)', margin, margin - 20);

      // Alpha label
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '12px monospace';
      ctx.fillText(`α = ${alpha} (${(alpha * 100).toFixed(0)}% significance)`, margin, margin - 5);
    }

    // Sample visualization (bottom half)
    const sampleBaseY = height - margin - 60;
    const sampleHeight = 200;

    // Draw histogram of sample
    if (sample.length > 0) {
      const bins = 20;
      const minVal = Math.min(...sample);
      const maxVal = Math.max(...sample);
      const binWidth = (maxVal - minVal) / bins;

      const histogram = new Array(bins).fill(0);
      sample.forEach(val => {
        const binIndex = Math.min(bins - 1, Math.floor((val - minVal) / binWidth));
        histogram[binIndex]++;
      });

      const maxCount = Math.max(...histogram);
      const barWidth = plotWidth / bins;

      histogram.forEach((count, i) => {
        const x = margin + i * barWidth;
        const barHeight = (count / maxCount) * sampleHeight * 0.6;
        const y = sampleBaseY - barHeight;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.strokeRect(x, y, barWidth - 2, barHeight);
      });

      // Draw population mean line
      const popMeanX = margin + ((populationMean - minVal) / (maxVal - minVal)) * plotWidth;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(popMeanX, sampleBaseY - sampleHeight * 0.7);
      ctx.lineTo(popMeanX, sampleBaseY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`H₀: μ = ${populationMean}`, popMeanX + 5, sampleBaseY - sampleHeight * 0.7 - 5);

      // Draw sample mean line
      const sampleMeanX = margin + ((sampleMeanCalc - minVal) / (maxVal - minVal)) * plotWidth;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sampleMeanX, sampleBaseY - sampleHeight * 0.7);
      ctx.lineTo(sampleMeanX, sampleBaseY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`x̄ = ${sampleMeanCalc.toFixed(1)}`, sampleMeanX + 5, sampleBaseY - sampleHeight * 0.7 + 15);

      // Confidence interval
      const ciLowerX = margin + ((ciLower - minVal) / (maxVal - minVal)) * plotWidth;
      const ciUpperX = margin + ((ciUpper - minVal) / (maxVal - minVal)) * plotWidth;
      const ciY = sampleBaseY + 20;

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ciLowerX, ciY);
      ctx.lineTo(ciUpperX, ciY);
      ctx.stroke();

      // CI endpoints
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.beginPath();
      ctx.arc(ciLowerX, ciY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ciUpperX, ciY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '10px monospace';
      ctx.fillText(`${(1 - alpha) * 100}% CI: [${ciLower.toFixed(1)}, ${ciUpper.toFixed(1)}]`, 
        margin, ciY - 10);

      // Title
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Sample Distribution (n = ${sample.length})`, margin, sampleBaseY - sampleHeight * 0.8);
    }

  }, [sample, showDistribution, showCriticalRegion, populationMean, alpha, tStatistic, criticalValue, rejectNull, ciLower, ciUpper, sampleMeanCalc]);

  const handleGenerateNew = () => {
    setSample(generateSample());
  };

  const handleAnimate = () => {
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setSample(generateSample());
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 300);
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
        {/* Hypothesis */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Null Hypothesis (H₀)</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Population Mean (μ₀)</label>
              <input
                type="number"
                value={populationMean}
                onChange={(e) => setPopulationMean(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sample Parameters */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Sample Parameters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Sample Size (n)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="text-xs text-cyan-400 text-center mt-1">{sampleSize}</div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">True Sample Mean</label>
              <input
                type="number"
                value={sampleMean}
                onChange={(e) => setSampleMean(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Std Dev (σ)</label>
              <input
                type="number"
                value={stdDev}
                onChange={(e) => setStdDev(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Significance Level */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Significance Level (α)</h3>
          <div className="grid grid-cols-3 gap-2">
            {[0.01, 0.05, 0.10].map(value => (
              <button
                key={value}
                onClick={() => setAlpha(value)}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  alpha === value
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-white/5 border-white/10 text-gray-300'
                }`}
              >
                {value}
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
                checked={showDistribution}
                onChange={(e) => setShowDistribution(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-sm text-gray-300">Show t-Distribution</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showCriticalRegion}
                onChange={(e) => setShowCriticalRegion(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500"
              />
              <span className="text-sm text-gray-300">Show Critical Region</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4 space-y-2">
          <button
            onClick={handleGenerateNew}
            disabled={animating}
            className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            🎲 Generate New Sample
          </button>
          <button
            onClick={handleAnimate}
            disabled={animating}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {animating ? '⏳ Sampling...' : '🎬 Animate Sampling'}
          </button>
        </div>

        {/* Test Results */}
        {sample.length > 0 && (
          <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Test Results</h3>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sample Mean (x̄):</span>
                <span className="font-mono text-emerald-400">{sampleMeanCalc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">t-statistic:</span>
                <span className="font-mono text-purple-400">{tStatistic.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">p-value:</span>
                <span className={`font-mono ${pValue < alpha ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {pValue.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Critical value:</span>
                <span className="font-mono text-red-400">±{criticalValue.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Effect size (d):</span>
                <span className="font-mono text-cyan-400">{effectSize.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Decision */}
        {sample.length > 0 && (
          <div className={`rounded-xl border p-3 ${
            rejectNull 
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{rejectNull ? '✅' : '⏸️'}</span>
              <h3 className={`text-xs font-bold ${
                rejectNull ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {rejectNull ? 'Reject H₀' : 'Fail to Reject H₀'}
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {rejectNull
                ? `p-value (${pValue.toFixed(4)}) < α (${alpha}). Statistically significant! Evidence suggests μ ≠ ${populationMean}.`
                : `p-value (${pValue.toFixed(4)}) ≥ α (${alpha}). Not significant. Insufficient evidence to reject μ = ${populationMean}.`}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className="text-xs font-bold text-purple-400">
              Understanding p-values
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            The p-value is the probability of seeing data this extreme if H₀ is true. Small p-value → strong evidence against H₀. The red tails show the critical region (α).
          </p>
        </div>
      </div>
    </div>
  );
};