import React, { useState, useEffect, useRef } from 'react';

const VectorSpaces = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [vectors, setVectors] = useState([
    { x: 150, y: -100, id: 1 },
    { x: 100, y: 150, id: 2 }
  ]);
  const [showSpan, setShowSpan] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [nextId, setNextId] = useState(3);

  // Check if vectors are linearly independent
  const areIndependent = () => {
    if (vectors.length === 0) return true;
    if (vectors.length === 1) return vectors[0].x !== 0 || vectors[0].y !== 0;
    if (vectors.length === 2) {
      const det = vectors[0].x * vectors[1].y - vectors[0].y * vectors[1].x;
      return Math.abs(det) > 0.01;
    }
    // For 2D, any 3+ vectors are linearly dependent
    return false;
  };

  // Calculate determinant for 2 vectors
  const getDeterminant = () => {
    if (vectors.length < 2) return 0;
    return vectors[0].x * vectors[1].y - vectors[0].y * vectors[1].x;
  };

  // Get dimension of span
  const getSpanDimension = () => {
    if (vectors.length === 0) return 0;
    if (vectors.length === 1) {
      return (vectors[0].x !== 0 || vectors[0].y !== 0) ? 1 : 0;
    }
    return areIndependent() ? 2 : 1;
  };

  // Draw everything
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

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw span if enabled
    if (showSpan && vectors.length > 0) {
      const spanDim = getSpanDimension();

      if (spanDim === 2) {
        // Fill entire plane
        ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.fillRect(0, 0, width, height);
      } else if (spanDim === 1) {
        // Draw line through vector(s)
        const v = vectors[0];
        const len = Math.sqrt(v.x * v.x + v.y * v.y);
        if (len > 0) {
          const dirX = v.x / len;
          const dirY = v.y / len;
          const maxLen = Math.max(width, height) * 2;

          ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
          ctx.lineWidth = 40;
          ctx.beginPath();
          ctx.moveTo(centerX - dirX * maxLen, centerY - dirY * maxLen);
          ctx.lineTo(centerX + dirX * maxLen, centerY + dirY * maxLen);
          ctx.stroke();
        }
      }
    }

    // Draw basis vectors (faint)
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 2;
    drawArrow(ctx, centerX, centerY, centerX + 80, centerY, false);
    drawArrow(ctx, centerX, centerY, centerX, centerY - 80, false);

    // Labels for axes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('x', centerX + 85, centerY - 5);
    ctx.fillText('y', centerX + 5, centerY - 85);

    // Draw user vectors
    vectors.forEach((v, idx) => {
      const colors = [
        { stroke: 'rgba(6, 182, 212, 1)', fill: 'rgba(6, 182, 212, 0.8)' },
        { stroke: 'rgba(168, 85, 247, 1)', fill: 'rgba(168, 85, 247, 0.8)' },
        { stroke: 'rgba(34, 197, 94, 1)', fill: 'rgba(34, 197, 94, 0.8)' },
        { stroke: 'rgba(251, 146, 60, 1)', fill: 'rgba(251, 146, 60, 0.8)' }
      ];
      const color = colors[idx % colors.length];

      ctx.strokeStyle = color.stroke;
      ctx.fillStyle = color.fill;
      ctx.lineWidth = 3;

      drawArrow(ctx, centerX, centerY, centerX + v.x, centerY + v.y, true);

      // Draw label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`v${idx + 1}`, centerX + v.x + 10, centerY + v.y - 10);

      // Draw coordinates
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(
        `(${(v.x / 40).toFixed(1)}, ${(-v.y / 40).toFixed(1)})`,
        centerX + v.x + 10,
        centerY + v.y + 5
      );
    });

  }, [vectors, showSpan]);

  // Draw arrow helper
  const drawArrow = (ctx, fromX, fromY, toX, toY, withHead) => {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    if (withHead) {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLen * Math.cos(angle - Math.PI / 6),
        toY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLen * Math.cos(angle + Math.PI / 6),
        toY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check if clicking on existing vector
    for (const v of vectors) {
      const vx = centerX + v.x;
      const vy = centerY + v.y;
      const dist = Math.sqrt((x - vx) ** 2 + (y - vy) ** 2);
      if (dist < 20) {
        setDraggingId(v.id);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (draggingId === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    setVectors(prev =>
      prev.map(v =>
        v.id === draggingId
          ? { ...v, x: x - centerX, y: y - centerY }
          : v
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleAddVector = () => {
    if (vectors.length >= 4) return;
    const angle = Math.random() * Math.PI * 2;
    const len = 80 + Math.random() * 80;
    setVectors([
      ...vectors,
      {
        x: Math.cos(angle) * len,
        y: Math.sin(angle) * len,
        id: nextId
      }
    ]);
    setNextId(nextId + 1);
  };

  const handleClear = () => {
    setVectors([]);
    setNextId(1);
  };

  const handlePreset = (preset) => {
    switch (preset) {
      case 'independent':
        setVectors([
          { x: 150, y: -100, id: 1 },
          { x: 100, y: 150, id: 2 }
        ]);
        setNextId(3);
        break;
      case 'dependent':
        setVectors([
          { x: 120, y: -80, id: 1 },
          { x: 180, y: -120, id: 2 }
        ]);
        setNextId(3);
        break;
      case 'basis':
        setVectors([
          { x: 80, y: 0, id: 1 },
          { x: 0, y: -80, id: 2 }
        ]);
        setNextId(3);
        break;
      default:
        break;
    }
  };

  const handleDeleteLast = () => {
    if (vectors.length > 0) {
      setVectors(vectors.slice(0, -1));
    }
  };

  const independent = areIndependent();
  const spanDim = getSpanDimension();
  const formsBasis = vectors.length === 2 && independent;
  const det = getDeterminant();

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border border-white/20 w-full max-w-5xl my-8 p-6 md:p-8 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 md:mb-6 sticky top-0 bg-slate-900 z-10 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
              Vector Spaces
            </h2>
            <p className="text-sm md:text-base text-gray-400">Visualize linear independence and span</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-sm"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-3 md:p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={500}
                className="w-full rounded-lg cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleAddVector}
                disabled={vectors.length >= 4}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add Vector {vectors.length >= 4 && '(Max 4)'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDeleteLast}
                  disabled={vectors.length === 0}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Delete Last
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all border border-white/10 text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePreset('independent')}
                  className="px-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  Independent
                </button>
                <button
                  onClick={() => handlePreset('dependent')}
                  className="px-2 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  Dependent
                </button>
                <button
                  onClick={() => handlePreset('basis')}
                  className="px-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  Basis
                </button>
              </div>
            </div>

            {/* Show Span Toggle */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSpan}
                  onChange={(e) => setShowSpan(e.target.checked)}
                  className="w-5 h-5 rounded accent-purple-500"
                />
                <span className="text-sm font-semibold text-gray-300">
                  Show Span
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Visualize all reachable points
              </p>
            </div>

            {/* Status */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Vector Space Info
              </h3>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vectors:</span>
                  <span className="font-mono text-white">{vectors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Independence:</span>
                  <span className={`font-semibold ${independent ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {independent ? '✅ Independent' : '❌ Dependent'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Span Dimension:</span>
                  <span className="font-mono text-cyan-400">{spanDim}D</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Forms Basis:</span>
                  <span className={`font-semibold ${formsBasis ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {formsBasis ? 'Yes' : 'No'}
                  </span>
                </div>
                {vectors.length === 2 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Determinant:</span>
                    <span className="font-mono text-purple-400">{det.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className={`rounded-xl border p-3 ${
              independent 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{independent ? '✅' : '⚠️'}</span>
                <h3 className={`text-xs font-bold ${
                  independent ? 'text-emerald-400' : 'text-orange-400'
                }`}>
                  {independent ? 'Linearly Independent' : 'Linearly Dependent'}
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {vectors.length === 0 && 'Add vectors to explore their relationships.'}
                {vectors.length === 1 && independent && 'One non-zero vector spans a line (1D).'}
                {vectors.length === 2 && independent && 'Two independent vectors span the entire plane (2D)!'}
                {vectors.length === 2 && !independent && 'These vectors are parallel - they only span a line (1D).'}
                {vectors.length >= 3 && spanDim === 2 && 'In 2D space, any 3+ vectors are dependent.'}
              </p>
            </div>

            {/* Legend */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Legend
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-cyan-500 rounded"></div>
                  <span className="text-gray-400">v1, v2, v3, v4</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500/30 rounded"></div>
                  <span className="text-gray-400">Span region</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gray-500/30 rounded"></div>
                  <span className="text-gray-400">Coordinate axes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 md:mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3">
            <span className="text-xl md:text-2xl">💡</span>
            <div className="flex-1">
              <p className="text-xs md:text-sm text-cyan-300 font-semibold mb-1.5 md:mb-2">
                How to Explore:
              </p>
              <ul className="text-xs md:text-sm text-gray-300 space-y-0.5 md:space-y-1">
                <li>• <strong>Drag vector endpoints</strong> to move them around</li>
                <li>• <strong>Add vectors</strong> and watch how the span changes</li>
                <li>• <strong>Try presets</strong> to see independent vs dependent vectors</li>
                <li>• <strong>Align two vectors</strong> - see them become dependent!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorSpaces;