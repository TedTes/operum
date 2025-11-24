import React, { useState, useEffect, useRef } from 'react';

export const AttentionMechanism = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [selectedToken, setSelectedToken] = useState(2);
  const [attentionType, setAttentionType] = useState('self-attention');
  const [showWeights, setShowWeights] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Example sentence
  const sentence = "The cat sat on the mat";
  const tokens = sentence.split(' ');

  // Simplified embeddings (2D for visualization)
  const embeddings = [
    [0.8, 0.3],   // The
    [0.5, 0.9],   // cat
    [0.2, 0.4],   // sat
    [0.6, 0.7],   // on
    [0.8, 0.3],   // the
    [0.3, 0.8]    // mat
  ];

  // Learned weight matrices (simplified 2x2)
  const W_Q = [[0.9, 0.1], [0.1, 0.9]]; // Query weights
  const W_K = [[0.8, 0.2], [0.2, 0.8]]; // Key weights
  const W_V = [[0.7, 0.3], [0.3, 0.7]]; // Value weights

  // Matrix multiplication helper
  const matMul = (a, b) => {
    return [
      a[0] * b[0][0] + a[1] * b[0][1],
      a[0] * b[1][0] + a[1] * b[1][1]
    ];
  };

  // Dot product
  const dotProduct = (a, b) => {
    return a[0] * b[0] + a[1] * b[1];
  };

  // Softmax
  const softmax = (scores) => {
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(s => s / sumExp);
  };

  // Calculate attention for selected token
  const calculateAttention = () => {
    // Query for selected token
    const query = matMul(embeddings[selectedToken], W_Q);

    // Keys for all tokens
    const keys = embeddings.map(emb => matMul(emb, W_K));

    // Compute attention scores (Q·K)
    const scores = keys.map(key => dotProduct(query, key));

    // Apply softmax
    const attentionWeights = softmax(scores);

    // Values for all tokens
    const values = embeddings.map(emb => matMul(emb, W_V));

    // Weighted sum of values
    const output = [0, 0];
    attentionWeights.forEach((weight, i) => {
      output[0] += weight * values[i][0];
      output[1] += weight * values[i][1];
    });

    return { query, keys, scores, attentionWeights, values, output };
  };

  const attention = calculateAttention();

  // Animation
  useEffect(() => {
    if (animating) {
      const interval = setInterval(() => {
        setAnimationStep(prev => {
          if (prev >= 5) {
            setAnimating(false);
            return 0;
          }
          return prev + 1;
        });
      }, 800);
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

    const tokenWidth = 100;
    const tokenHeight = 60;
    const spacing = 20;
    const startX = (width - (tokens.length * (tokenWidth + spacing) - spacing)) / 2;
    const tokenY = height / 2 - tokenHeight / 2;

    // Draw attention connections
    if (showWeights) {
      tokens.forEach((token, i) => {
        const targetX = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
        const sourceX = startX + selectedToken * (tokenWidth + spacing) + tokenWidth / 2;
        const sourceY = tokenY + tokenHeight;
        const targetY = tokenY;

        const weight = attention.attentionWeights[i];
        const opacity = Math.min(weight * 2, 1);

        // Connection line
        ctx.strokeStyle = i === selectedToken 
          ? `rgba(251, 191, 36, ${opacity})` 
          : `rgba(139, 92, 246, ${opacity})`;
        ctx.lineWidth = Math.max(weight * 20, 1);
        
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        
        // Curved line
        const controlY = sourceY + 80;
        ctx.quadraticCurveTo(sourceX, controlY, targetX, targetY);
        ctx.stroke();

        // Weight label
        if (weight > 0.05) {
          const midX = (sourceX + targetX) / 2;
          const midY = sourceY + 60;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.arc(midX, midY, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = i === selectedToken ? '#fbbf24' : '#a78bfa';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(weight.toFixed(2), midX, midY);
        }
      });
    }

    // Draw tokens
    tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + spacing);
      const isSelected = i === selectedToken;

      // Token box
      ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.2)' : 'rgba(30, 41, 59, 0.8)';
      ctx.fillRect(x, tokenY, tokenWidth, tokenHeight);

      // Border
      ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(x, tokenY, tokenWidth, tokenHeight);

      // Glow for selected
      if (isSelected) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.lineWidth = 8;
        ctx.strokeRect(x - 4, tokenY - 4, tokenWidth + 8, tokenHeight + 8);
      }

      // Token text
      ctx.fillStyle = isSelected ? '#fbbf24' : '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, x + tokenWidth / 2, tokenY + tokenHeight / 2);

      // Attention weight below if showing
      if (showWeights && !isSelected) {
        const weight = attention.attentionWeights[i];
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${(weight * 100).toFixed(0)}%`, x + tokenWidth / 2, tokenY + tokenHeight + 20);
      }
    });

    // Query label
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const queryX = startX + selectedToken * (tokenWidth + spacing) + tokenWidth / 2;
    ctx.fillText('Query', queryX, tokenY - 30);

    // Title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Self-Attention: "Where should I focus?"', width / 2, 40);

    // Explanation at bottom
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Token "${tokens[selectedToken]}" is attending to all tokens. Thickness = attention strength.`,
      width / 2,
      height - 30
    );

  }, [selectedToken, showWeights, tokens, attention]);

  const handleStartAnimation = () => {
    setAnimationStep(0);
    setAnimating(true);
  };

  // Get animation step description
  const getStepDescription = () => {
    const steps = [
      { title: 'Step 1: Embeddings', desc: 'Each word is converted to a vector (embedding)' },
      { title: 'Step 2: Compute Query', desc: `Q = W_Q × embedding["${tokens[selectedToken]}"]` },
      { title: 'Step 3: Compute Keys', desc: 'K = W_K × embeddings[all tokens]' },
      { title: 'Step 4: Attention Scores', desc: 'Score = Q · K (dot product)' },
      { title: 'Step 5: Softmax', desc: 'Weights = softmax(scores) → sum to 1' },
      { title: 'Step 6: Weighted Values', desc: 'Output = Σ(weight × value)' }
    ];
    return steps[animationStep] || steps[0];
  };

  const stepInfo = getStepDescription();

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Visualization */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Main Canvas */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 flex-1">
          <canvas
            ref={canvasRef}
            width={900}
            height={400}
            className="w-full h-auto cursor-pointer"
            onClick={(e) => {
              const canvas = canvasRef.current;
              const rect = canvas.getBoundingClientRect();
              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
              
              const tokenWidth = 100;
              const spacing = 20;
              const startX = (canvas.width - (tokens.length * (tokenWidth + spacing) - spacing)) / 2;
              
              tokens.forEach((token, i) => {
                const tokenX = startX + i * (tokenWidth + spacing);
                if (x >= tokenX && x <= tokenX + tokenWidth) {
                  setSelectedToken(i);
                }
              });
            }}
          />
        </div>

        {/* QKV Matrices Visualization */}
        <div className="grid grid-cols-3 gap-4">
          {/* Query */}
          <div className="bg-slate-900/50 rounded-xl border border-yellow-500/30 p-3">
            <h3 className="text-xs font-semibold text-yellow-400 mb-2">Query (Q)</h3>
            <div className="font-mono text-xs text-gray-300">
              [{attention.query[0].toFixed(3)}, {attention.query[1].toFixed(3)}]
            </div>
            <p className="text-xs text-gray-500 mt-2">What I'm looking for</p>
          </div>

          {/* Keys */}
          <div className="bg-slate-900/50 rounded-xl border border-purple-500/30 p-3">
            <h3 className="text-xs font-semibold text-purple-400 mb-2">Keys (K)</h3>
            <div className="font-mono text-xs text-gray-300 space-y-1">
              {attention.keys.slice(0, 3).map((key, i) => (
                <div key={i}>[{key[0].toFixed(2)}, {key[1].toFixed(2)}]</div>
              ))}
              <div className="text-gray-600">...</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">What I contain</p>
          </div>

          {/* Values */}
          <div className="bg-slate-900/50 rounded-xl border border-cyan-500/30 p-3">
            <h3 className="text-xs font-semibold text-cyan-400 mb-2">Values (V)</h3>
            <div className="font-mono text-xs text-gray-300 space-y-1">
              {attention.values.slice(0, 3).map((val, i) => (
                <div key={i}>[{val[0].toFixed(2)}, {val[1].toFixed(2)}]</div>
              ))}
              <div className="text-gray-600">...</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">What I output</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Token Selection */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Select Query Token</h3>
          <div className="grid grid-cols-2 gap-2">
            {tokens.map((token, i) => (
              <button
                key={i}
                onClick={() => setSelectedToken(i)}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  selectedToken === i
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {token}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click a token to see what it attends to
          </p>
        </div>

        {/* Display Options */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Display</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showWeights}
              onChange={(e) => setShowWeights(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
            <span className="text-sm text-gray-300">Show Attention Weights</span>
          </label>
        </div>

        {/* Attention Weights */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Attention Distribution</h3>
          <div className="space-y-2">
            {tokens.map((token, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={i === selectedToken ? 'text-yellow-400 font-semibold' : 'text-gray-400'}>
                    {token}
                  </span>
                  <span className="font-mono text-purple-400">
                    {(attention.attentionWeights[i] * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      i === selectedToken ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${attention.attentionWeights[i] * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Weights sum to 100% (softmax normalization)
          </p>
        </div>

        {/* Attention Scores */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Raw Scores (Q·K)</h3>
          <div className="space-y-1 text-xs">
            {tokens.map((token, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-400">{token}:</span>
                <span className="font-mono text-cyan-400">
                  {attention.scores[i].toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className="text-xs font-bold text-purple-400">
              Self-Attention Magic
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Each token asks: "Which other tokens are relevant to me?" The attention weights tell us!
            High weight = strong relationship. This is how Transformers understand context (GPT, BERT, etc).
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">How It Works</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-yellow-400 mb-1">1. Query (Q)</div>
              <div className="text-gray-400">What am I looking for?</div>
            </div>
            <div>
              <div className="font-semibold text-purple-400 mb-1">2. Key (K)</div>
              <div className="text-gray-400">What do I contain?</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-400 mb-1">3. Score</div>
              <div className="text-gray-400">Q · K = similarity</div>
            </div>
            <div>
              <div className="font-semibold text-emerald-400 mb-1">4. Softmax</div>
              <div className="text-gray-400">Normalize to weights</div>
            </div>
            <div>
              <div className="font-semibold text-orange-400 mb-1">5. Value (V)</div>
              <div className="text-gray-400">What to output</div>
            </div>
            <div>
              <div className="font-semibold text-pink-400 mb-1">6. Output</div>
              <div className="text-gray-400">Σ(weight × value)</div>
            </div>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="bg-cyan-500/10 rounded-xl border border-cyan-500/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">🤖</span>
            <h3 className="text-xs font-bold text-cyan-400">
              Powers Modern AI
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Attention is the core of Transformers! Used in: GPT (text), BERT (understanding), Vision Transformers (images), 
            Whisper (speech), AlphaFold (proteins). "Attention is All You Need" (2017) changed everything!
          </p>
        </div>
      </div>
    </div>
  );
};