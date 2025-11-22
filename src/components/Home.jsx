import React, { useState, useEffect, useRef, Fragment } from 'react';
import {ToolWorkspace,SVD} from './';


export const Home = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState(null);
  const particlesRef = useRef([]);

  const targetMousePos = useRef({ x: 0, y: 0 });
  const currentMousePos = useRef({ x: 0, y: 0 });

  // Smooth mouse tracking
  useEffect(() => {
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    const smoothMouseTracking = () => {
      currentMousePos.current.x = lerp(currentMousePos.current.x, targetMousePos.current.x, 0.08);
      currentMousePos.current.y = lerp(currentMousePos.current.y, targetMousePos.current.y, 0.08);
      setMousePos({ ...currentMousePos.current });
      requestAnimationFrame(smoothMouseTracking);
    };

    smoothMouseTracking();
  }, []);

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      { color: 'rgba(59, 130, 246, 0.7)', glow: 'rgba(59, 130, 246, 0.3)' },
      { color: 'rgba(139, 92, 246, 0.7)', glow: 'rgba(139, 92, 246, 0.3)' },
      { color: 'rgba(6, 182, 212, 0.7)', glow: 'rgba(6, 182, 212, 0.3)' },
      { color: 'rgba(168, 85, 247, 0.7)', glow: 'rgba(168, 85, 247, 0.3)' }
    ];

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        const colorSet = colors[i % colors.length];
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: Math.random() * 1.2 + 0.8,
          color: colorSet.color,
          glow: colorSet.glow,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }

    let time = 0;
    
    const animate = () => {
      time += 0.01;
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        const dx = currentMousePos.current.x - particle.x;
        const dy = currentMousePos.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180 * 0.012;
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
        }

        particle.vx *= 0.99;
        particle.vy *= 0.99;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        const pulse = Math.sin(time + particle.pulseOffset) * 0.3 + 1;
        const currentRadius = particle.radius * pulse;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.glow;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < Math.min(i + 6, particlesRef.current.length); j++) {
          const other = particlesRef.current[j];
          const dx2 = particle.x - other.x;
          const dy2 = particle.y - other.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < 100) {
            const opacity = (1 - dist2 / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetMousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Available tools
  const tools = [
    // Linear Algebra
    {
      id: 'matrix-transform',
      title: 'Matrix Transformations',
      description: 'See how matrices transform space',
      icon: '📐',
      category: 'Linear Algebra',
      color: 'from-cyan-500 to-blue-500',
      concepts: ['Rotation', 'Scaling', 'Shear', 'Eigenvectors']
    },
    {
      id: 'vector-spaces',
      title: 'Vector Spaces',
      description: 'Visualize linear independence',
      icon: '🎯',
      category: 'Linear Algebra',
      color: 'from-cyan-500 to-blue-500',
      concepts: ['Span', 'Basis', 'Linear Independence', 'Subspaces']
    },
    {
      id: 'svd',
      title: 'Singular Value Decomposition',
      description: 'Matrix factorization in action',
      icon: '🔲',
      category: 'Linear Algebra',
      color: 'from-cyan-500 to-blue-500',
      concepts: ['Decomposition', 'Singular Values', 'Image Compression']
    },
    
    // Optimization
    {
      id: 'gradient-descent',
      title: 'Gradient Descent',
      description: 'Watch optimization in action',
      icon: '⛰️',
      category: 'Optimization',
      color: 'from-purple-500 to-pink-500',
      concepts: ['Learning Rate', 'Local Minima', 'Momentum', 'Convergence']
    },
    {
      id: 'lagrange',
      title: 'Lagrange Multipliers',
      description: 'Constrained optimization',
      icon: '🎚️',
      category: 'Optimization',
      color: 'from-purple-500 to-pink-500',
      concepts: ['Constraints', 'Dual Problem', 'KKT Conditions']
    },
    {
      id: 'convex-opt',
      title: 'Convex Optimization',
      description: 'Global vs local optima',
      icon: '📉',
      category: 'Optimization',
      color: 'from-purple-500 to-pink-500',
      concepts: ['Convexity', 'Global Minimum', 'Feasible Region']
    },
    
    // Probability & Statistics
    {
      id: 'probability-dist',
      title: 'Probability Distributions',
      description: 'Explore statistical distributions',
      icon: '🎲',
      category: 'Probability',
      color: 'from-orange-500 to-amber-500',
      concepts: ['Normal', 'Binomial', 'Sampling', 'PDF/CDF']
    },
    {
      id: 'bayes-theorem',
      title: 'Bayesian Inference',
      description: 'Update beliefs with evidence',
      icon: '🔮',
      category: 'Probability',
      color: 'from-orange-500 to-amber-500',
      concepts: ['Prior', 'Likelihood', 'Posterior', 'Conjugacy']
    },
    {
      id: 'monte-carlo',
      title: 'Monte Carlo Methods',
      description: 'Random sampling for estimation',
      icon: '🎰',
      category: 'Probability',
      color: 'from-orange-500 to-amber-500',
      concepts: ['Sampling', 'Convergence', 'Integration', 'Variance']
    },
    {
      id: 'linear-regression',
      title: 'Linear Regression',
      description: 'Fit lines to data interactively',
      icon: '📊',
      category: 'Statistical Learning',
      color: 'from-indigo-500 to-blue-500',
      concepts: ['Least Squares', 'Residuals', 'R²', 'Outliers']
    },
    {
      id: 'logistic-regression',
      title: 'Logistic Regression',
      description: 'Binary classification boundaries',
      icon: '📈',
      category: 'Statistical Learning',
      color: 'from-indigo-500 to-blue-500',
      concepts: ['Sigmoid', 'Decision Boundary', 'Log-Odds', 'Classification']
    },
    {
      id: 'hypothesis-test',
      title: 'Hypothesis Testing',
      description: 'Statistical significance',
      icon: '🧪',
      category: 'Statistical Learning',
      color: 'from-indigo-500 to-blue-500',
      concepts: ['p-value', 't-test', 'Confidence Intervals', 'Type I/II Errors']
    },
    
    // Deep Learning
    {
      id: 'neural-network',
      title: 'Neural Network Playground',
      description: 'Build and train networks live',
      icon: '🧠',
      category: 'Deep Learning',
      color: 'from-emerald-500 to-teal-500',
      concepts: ['Layers', 'Activations', 'Training', 'Decision Boundary']
    },
    {
      id: 'backprop',
      title: 'Backpropagation',
      description: 'Step through gradient flow',
      icon: '🔄',
      category: 'Deep Learning',
      color: 'from-violet-500 to-purple-500',
      concepts: ['Chain Rule', 'Gradients', 'Weight Updates', 'Flow']
    },
    {
      id: 'activation-functions',
      title: 'Activation Functions',
      description: 'Compare ReLU, Sigmoid, Tanh',
      icon: '⚡',
      category: 'Deep Learning',
      color: 'from-violet-500 to-purple-500',
      concepts: ['ReLU', 'Sigmoid', 'Tanh', 'Vanishing Gradients']
    },
    {
      id: 'convolution',
      title: 'Convolution Operation',
      description: 'How CNNs process images',
      icon: '🖼️',
      category: 'Deep Learning',
      color: 'from-emerald-500 to-teal-500',
      concepts: ['Filters', 'Feature Maps', 'Stride', 'Padding']
    },
    {
      id: 'attention',
      title: 'Attention Mechanism',
      description: 'Query-Key-Value explained',
      icon: '👁️',
      category: 'Deep Learning',
      color: 'from-violet-500 to-purple-500',
      concepts: ['Q-K-V', 'Self-Attention', 'Multi-Head', 'Transformers']
    }
  ];

  return (
    <div className="relative bg-slate-950 text-white min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #8b5cf6, #06b6d4);
          border-radius: 4px;
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, #1e1b4b, #0f172a)' }}
      />

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                Applied Math Lab
              </h1>
              <p className="text-sm text-gray-400 mt-1">Interactive mathematical explorations</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm transition-colors">
                About
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Tools List */}
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Group tools by category */}
          {[
            { 
              category: 'Linear Algebra', 
              tools: tools.filter(t => t.category === 'Linear Algebra') 
            },
            { 
              category: 'Optimization', 
              tools: tools.filter(t => t.category === 'Optimization') 
            },
            { 
              category: 'Probability & Statistics', 
              tools: tools.filter(t => ['Probability', 'Statistical Learning'].includes(t.category)) 
            },
            { 
              category: 'Deep Learning', 
              tools: tools.filter(t => t.category === 'Deep Learning') 
            }
          ].map((group, groupIdx) => (
            group.tools.length > 0 && (
              <div key={group.category} style={{ animation: `fadeInUp 0.5s ease-out ${groupIdx * 0.15}s forwards`, opacity: 0 }}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent flex-1" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {group.category}
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent flex-1" />
                </div>

                {/* Tools in this category */}
                <div className="space-y-2">
                  {group.tools.map((tool, idx) => (
                    <div
                      key={tool.id}
                      className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/50 p-5 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      {/* Hover gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                      
                      <div className="relative z-10 flex items-center gap-4">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          <span role="img" aria-label={tool.title} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {tool.icon}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 mb-1">
                            <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                              {tool.title}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {tool.description}
                            </span>
                          </div>
                          
                          {/* Concepts - inline */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {tool.concepts.map((concept, i) => (
                              <React.Fragment key={i}>
                                <span className="text-xs text-gray-500">
                                  {concept}
                                </span>
                                {i < tool.concepts.length - 1 && (
                                  <span className="text-gray-700">•</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex-shrink-0 text-gray-500 group-hover:text-cyan-400 transition-colors">
                          <svg 
                            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <div className="inline-block px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-gray-400 text-sm">
              🚧 More tools coming soon: PCA, K-Means, Convolution, Attention, and more
            </p>
          </div>
        </div>

        {/* Tool Workspace */}
        {selectedTool && (
          <ToolWorkspace 
          initialTool={selectedTool} 
          onClose={() => setSelectedTool(null)} 
        />
        )}

      </div>
    </div>
  );
};
