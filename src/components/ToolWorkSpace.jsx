import React, { useState, useEffect } from 'react';

import {LagrangeMultipliers,SVD,VectorSpaces,GradientDescent,MatrixTransform,ConvexOptimization,ProbabilityDistributions} from "./"
export const ToolWorkspace = ({ initialTool, onClose }) => {
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Auto-hide sidebars on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      } else {
        setShowLeftSidebar(true);
        setShowRightSidebar(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // All available tools organized by category
  const toolCategories = [
    {
      name: 'Linear Algebra',
      tools: [
        { id: 'matrix-transform', name: 'Matrix Transformations', icon: '📐' },
        { id: 'vector-spaces', name: 'Vector Spaces', icon: '🎯' },
        { id: 'svd', name: 'SVD', icon: '🔲' }
      ]
    },
    {
      name: 'Optimization',
      tools: [
        { id: 'gradient-descent', name: 'Gradient Descent', icon: '⛰️' },
        { id: 'lagrange', name: 'Lagrange Multipliers', icon: '🎚️' },
        { id: 'convex-opt', name: 'Convex Optimization', icon: '📉' }
      ]
    },
    {
      name: 'Probability & Statistics',
      tools: [
        { id: 'probability-dist', name: 'Probability Distributions', icon: '🎲'},
        { id: 'bayes-theorem', name: 'Bayesian Inference', icon: '🔮', disabled: true },
        { id: 'monte-carlo', name: 'Monte Carlo Methods', icon: '🎰', disabled: true },
        { id: 'linear-regression', name: 'Linear Regression', icon: '📊', disabled: true },
        { id: 'logistic-regression', name: 'Logistic Regression', icon: '📈', disabled: true },
        { id: 'hypothesis-test', name: 'Hypothesis Testing', icon: '🧪', disabled: true }
      ]
    },
    {
      name: 'Deep Learning',
      tools: [
        { id: 'neural-network', name: 'Neural Network Playground', icon: '🧠', disabled: true },
        { id: 'backprop', name: 'Backpropagation', icon: '🔄', disabled: true },
        { id: 'activation-functions', name: 'Activation Functions', icon: '⚡', disabled: true },
        { id: 'convolution', name: 'Convolution Operation', icon: '🖼️', disabled: true },
        { id: 'attention', name: 'Attention Mechanism', icon: '👁️', disabled: true }
      ]
    }
  ];

  // Get current tool info
  const getCurrentTool = () => {
    for (const category of toolCategories) {
      const tool = category.tools.find(t => t.id === selectedTool);
      if (tool) return tool;
    }
    return null;
  };

  // Render the demo component
  const renderDemo = () => {
    // Pass onClose as null since we're handling it at workspace level
    switch (selectedTool) {
      case 'matrix-transform':
        return <MatrixTransform onClose={() => {}} />;
      case 'gradient-descent':
        return <GradientDescent onClose={() => {}} />;
      case 'vector-spaces':
        return <VectorSpaces onClose={() => {}} />;
      case 'svd':
        return <SVD onClose={() => {}} />;
      case 'lagrange':
        return <LagrangeMultipliers onClose={() => {}} />;
      case 'convex-opt':
        return <ConvexOptimization onClose={() => {}} />;
      case 'probability-dist':
        return <ProbabilityDistributions onClose={() => {}} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-gray-400">Tool coming soon...</p>
            </div>
          </div>
        );
    }
  };

  // Get guide content for current tool
  const getGuideContent = () => {
    const guides = {
      'matrix-transform': {
        title: 'Matrix Transformations',
        sections: [
          {
            heading: 'What Are Matrix Transformations?',
            content: 'Matrices are like machines that transform space. When you multiply a vector by a matrix, you\'re applying a transformation - rotating, scaling, shearing, or reflecting the vector.'
          },
          {
            heading: 'Why It Matters',
            content: 'Matrix transformations are everywhere: computer graphics (rotating 3D models), machine learning (neural networks), physics (changing coordinate systems), and more.'
          },
          {
            heading: 'The Intuition',
            content: 'Think of a matrix as a recipe for transforming space. Each column tells you where the basis vectors (x and y axes) end up. Everything else follows from there.'
          },
          {
            heading: 'Key Concepts',
            list: [
              'Rotation: Spins space without changing size',
              'Scaling: Stretches or shrinks along axes',
              'Shear: Slants space like a deck of cards',
              'Determinant: How much area changes (2x means areas double)'
            ]
          },
          {
            heading: 'Try This',
            list: [
              'Set rotation to 90° - see everything spin',
              'Set scale to 2 - watch the F grow',
              'Try negative scale - see reflection (mirror flip)',
              'Combine both - rotation + scaling together'
            ]
          }
        ]
      },
      'gradient-descent': {
        title: 'Gradient Descent',
        sections: [
          {
            heading: 'What Is Gradient Descent?',
            content: 'Imagine rolling a ball down a hill to find the lowest valley. Gradient descent does this mathematically - it finds the minimum of a function by following the steepest downward slope.'
          },
          {
            heading: 'Why It Matters',
            content: 'This is how AI learns! Neural networks use gradient descent to minimize errors. It\'s the engine behind ChatGPT, image recognition, and modern machine learning.'
          },
          {
            heading: 'The Intuition',
            content: 'At each step, calculate which direction is "downhill" (the gradient), then take a step in that direction. The learning rate controls step size - too big and you overshoot, too small and you crawl.'
          },
          {
            heading: 'Key Concepts',
            list: [
              'Gradient: Direction of steepest ascent (we go opposite)',
              'Learning Rate: Step size - crucial hyperparameter',
              'Local Minimum: Where you get stuck',
              'Convergence: When you reach the bottom'
            ]
          },
          {
            heading: 'Try This',
            list: [
              'Learning rate 0.1 - smooth descent',
              'Learning rate 0.8 - watch it bounce/overshoot',
              'Learning rate 0.005 - painfully slow',
              'Click Random - see all paths lead to center'
            ]
          }
        ]
      },
      'vector-spaces': {
        title: 'Vector Spaces',
        sections: [
          {
            heading: 'What Are Vector Spaces?',
            content: 'A vector space is all the points you can reach by combining vectors. Two independent vectors span a plane - you can reach any 2D point. If they\'re dependent (parallel), you only get a line.'
          },
          {
            heading: 'Why It Matters',
            content: 'Understanding span and independence is crucial for dimensionality reduction (PCA), solving equations (linear systems), and machine learning (feature spaces).'
          },
          {
            heading: 'The Intuition',
            content: 'Think of vectors as movements. Two independent vectors are like "go forward" and "go right" - together they let you reach anywhere on a plane. Dependent vectors are like "go forward" and "go forward twice" - redundant!'
          },
          {
            heading: 'Key Concepts',
            list: [
              'Linear Independence: No vector is a combination of others',
              'Span: All points reachable by combining vectors',
              'Basis: Minimal set of vectors that span the space',
              'Dimension: Number of independent vectors needed'
            ]
          },
          {
            heading: 'Try This',
            list: [
              'Load Independent preset - see 2D plane (purple fill)',
              'Load Dependent preset - only a line (they\'re parallel)',
              'Drag one vector to align with another - watch span collapse',
              'Add 3 vectors - still only 2D (any 3rd is redundant)'
            ]
          }
        ]
      },
      'svd': {
        title: 'Singular Value Decomposition',
        sections: [
          {
            heading: 'What Is SVD?',
            content: 'SVD breaks any matrix into three simple pieces: rotate, scale, rotate. It\'s like saying "any transformation is just spinning, stretching, and spinning again." The magic is that the stretching happens along special directions (singular vectors).'
          },
          {
            heading: 'Why It Matters',
            content: 'SVD powers JPEG image compression, Netflix recommendations, Google\'s PageRank, and dimensionality reduction (PCA). It finds the "principal patterns" in data and lets you keep only the important ones.'
          },
          {
            heading: 'The Intuition',
            content: 'Every matrix transformation can be decomposed into: (1) rotate to align with principal axes (V^T), (2) stretch along those axes (Σ), (3) rotate to final orientation (U). The singular values tell you how important each direction is.'
          },
          {
            heading: 'Key Concepts',
            list: [
              'U, V: Rotation matrices (orthonormal)',
              'Σ: Diagonal scaling (singular values)',
              'Rank: Number of non-zero singular values',
              'Low-rank approximation: Keep top k values = compression'
            ]
          },
          {
            heading: 'Try This',
            list: [
              'Play Animation - see the 3 steps clearly',
              'Rank = 2 (full) - perfect reconstruction',
              'Rank = 1 - only dominant pattern (50% compression)',
              'Watch singular values - bright = important'
            ]
          }
        ]
      },
      'lagrange': {
        title: 'Lagrange Multipliers',
        sections: [
          {
            heading: 'What Are Lagrange Multipliers?',
            content: 'A method for finding maxima/minima of a function subject to constraints. Instead of searching everywhere, you only look along the constraint (like finding the highest point on a path up a mountain).'
          },
          {
            heading: 'Why It Matters',
            content: 'Constrained optimization is everywhere: maximizing profit with limited budget, training neural networks with regularization, physics (finding equilibrium states), economics (utility maximization), and engineering design.'
          },
          {
            heading: 'The Intuition',
            content: 'At the optimum, you can\'t improve by moving along the constraint. This happens when the objective gradient ∇f is perpendicular to the constraint - or parallel to the constraint\'s gradient ∇g. So ∇f = λ∇g for some λ (the Lagrange multiplier).'
          },
          {
            heading: 'Key Concepts',
            list: [
              'Constraint: Equation that limits where you can go (g(x,y) = 0)',
              'Lagrangian: L = f + λg (combines objective and constraint)',
              'λ (lambda): How much the constraint "costs" the objective',
              'Optimality: ∇f = λ∇g (gradients aligned at solution)'
            ]
          },
          {
            heading: 'Try This',
            list: [
              'Adjust λ - watch λ∇g try to match ∇f',
              'When λ ≈ 2, gradients align (optimal!)',
              'Rotate the view to see the 3D surface',
              'Toggle gradients off to see just the constraint'
            ]
          }
        ]
      },
      'convex-opt': { 
  title: 'Convex Optimization',
  sections: [
    {
      heading: 'What Is Convex Optimization?',
      content: 'A convex function has a bowl shape - any local minimum is the global minimum. Non-convex functions have multiple valleys where gradient descent can get stuck.'
    },
    {
      heading: 'Why It Matters',
      content: 'Convex problems are "easy" - gradient descent always works! Most ML loss functions are designed to be convex (or nearly so). Non-convex problems (like neural networks) need special techniques.'
    },
    {
      heading: 'The Intuition',
      content: 'Imagine a ball rolling downhill. On a convex surface (bowl), it always reaches the lowest point. On a non-convex surface (mountains and valleys), it might get stuck in a local valley that\'s not the deepest one.'
    },
    {
      heading: 'Key Concepts',
      list: [
        'Convex: Single bowl - any local min = global min',
        'Non-Convex: Multiple valleys - local minima exist',
        'Saddle Point: Neither min nor max - flat in some directions',
        'Global vs Local: Best overall vs best nearby'
      ]
    },
    {
      heading: 'Try This',
      list: [
        'Start with Convex - always finds global minimum',
        'Switch to Non-Convex - gets stuck in local minima',
        'Drag start point - different starting points → different results',
        'Try Saddle - gradient descent gets confused!'
      ]
    }
  ]
},
'probability-dist': {  // ← ADD THIS ENTIRE OBJECT
  title: 'Probability Distributions',
  sections: [
    {
      heading: 'What Are Probability Distributions?',
      content: 'A probability distribution describes how likely different outcomes are. The PDF (Probability Density Function) shows the shape, while the CDF (Cumulative Distribution Function) shows accumulated probability up to a point.'
    },
    {
      heading: 'Why It Matters',
      content: 'Distributions model uncertainty everywhere: stock returns (Normal), customer arrivals (Poisson), system failures (Exponential), survey responses (Binomial). Understanding distributions is fundamental to statistics and machine learning.'
    },
    {
      heading: 'The Intuition',
      content: 'Think of PDF as a hill - tall sections are more likely outcomes. CDF is like walking up that hill - it shows total probability up to each point (always increases from 0 to 1). Samples show what you\'d actually observe in practice.'
    },
    {
      heading: 'Key Concepts',
      list: [
        'PDF: Height = likelihood (area under curve = probability)',
        'CDF: Cumulative probability from -∞ to x',
        'Normal: Bell curve, models averages (CLT)',
        'Binomial: Coin flips, fixed trials',
        'Poisson: Rare events, variable occurrences',
        'Exponential: Waiting times between events'
      ]
    },
    {
      heading: 'Try This',
      list: [
        'Normal: Change μ (shifts curve), σ (width)',
        'Binomial: n=20, p=0.5 looks like Normal!',
        'Enable Samples - see theory match reality',
        'Compare PDF vs CDF - CDF always increases',
        'Poisson: Low λ = rare events, High λ = frequent'
      ]
    }
  ]
}
    };

    return guides[selectedTool] || {
      title: 'Coming Soon',
      sections: [{ heading: 'Guide', content: 'Documentation for this tool is coming soon.' }]
    };
  };

  const currentTool = getCurrentTool();
  const guideContent = getGuideContent();

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex">
      {/* Mobile backdrop - clicks outside sidebar to close */}
      {(showLeftSidebar || showRightSidebar) && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => {
            setShowLeftSidebar(false);
            setShowRightSidebar(false);
          }}
        />
      )}

      {/* Left Sidebar - Tools List */}
      <div className={`
        bg-slate-900 border-r border-white/10 transition-all duration-300 
        lg:relative lg:flex-shrink-0
        ${showLeftSidebar ? 'fixed lg:static inset-y-0 left-0 z-40 w-64' : 'w-0 -translate-x-full lg:translate-x-0'}
      `}>
        {showLeftSidebar && (
          <div className="h-full overflow-y-auto p-4 w-64">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Applied Math Lab</h2>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                ← Back to Home
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              {toolCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {category.name}
                  </h3>
                  <div className="space-y-1">
                    {category.tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => !tool.disabled && setSelectedTool(tool.id)}
                        disabled={tool.disabled}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                          selectedTool === tool.id
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : tool.disabled
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{tool.icon}</span>
                        <span className="flex-1">{tool.name}</span>
                        {selectedTool === tool.id && <span className="text-cyan-400">✓</span>}
                        {tool.disabled && <span className="text-xs text-gray-600">Soon</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              title="Toggle tools list"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold text-white flex items-center gap-2 truncate">
                <span className="flex-shrink-0">{currentTool?.icon}</span>
                <span className="truncate">{currentTool?.name}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm flex items-center gap-2"
              title="Toggle guide"
            >
              <span>📖</span>
              <span className="hidden sm:inline">Guide</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Demo + Guide */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center - Demo Area */}
          <div className="flex-1 overflow-auto bg-slate-950 min-w-0">
            {renderDemo()}
          </div>

          {/* Right Sidebar - Guide */}
          <div className={`
            bg-slate-900 border-l border-white/10 transition-all duration-300
            lg:relative lg:flex-shrink-0
            ${showRightSidebar ? 'fixed lg:static inset-y-0 right-0 z-40 w-80' : 'w-0 translate-x-full lg:translate-x-0'}
          `}>
            {showRightSidebar && (
              <div className="h-full overflow-y-auto p-6 w-80">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <span>📖</span>
                    {guideContent.title}
                  </h2>
                  <p className="text-xs text-gray-500">Learn the concepts</p>
                </div>

                <div className="space-y-6">
                  {guideContent.sections.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-bold text-cyan-400 mb-2">
                        {section.heading}
                      </h3>
                      {section.content && (
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">
                          {section.content}
                        </p>
                      )}
                      {section.list && (
                        <ul className="space-y-2">
                          {section.list.map((item, i) => (
                            <li key={i} className="text-sm text-gray-400 flex gap-2">
                              <span className="text-cyan-500">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};