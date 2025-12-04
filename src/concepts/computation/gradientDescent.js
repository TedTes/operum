/**
 * GRADIENT DESCENT CONCEPT
 * 
 * Iterative optimization algorithm that follows the negative gradient
 * to find local minima of differentiable functions.
 * 
 * Layer: COMPUTATION
 * Domain: OPTIMIZATION
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { GradientDescent } from '../../components/GradientDescent.jsx';

export default {
  // ==========================================================================
  // METADATA
  // ==========================================================================
  
  id: 'gradient-descent',
  name: 'Gradient Descent',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.OPTIMIZATION,
  secondaryDomains: [DOMAINS.MACHINE_LEARNING],

  // ==========================================================================
  // DEPENDENCIES
  // ==========================================================================
  
  prerequisites: [
    'vectors',           // Need to understand vectors
    'functions',         // Need to understand functions
    'gradient-rules',    // Need to understand gradients
    'differentiable-functions' // Functions must be differentiable
  ],
  
  enables: [
    'backpropagation',
    'neural-networks',
    'linear-regression',
    'logistic-regression',
    'stochastic-gradient-descent'
  ],
  
  relatedConcepts: [
    'convex-optimization',
    'learning-rate',
    'convergence',
    'local-minima'
  ],

  // ==========================================================================
  // VISUALIZATION
  // ==========================================================================
  
  visualization: GradientDescent,

  // ==========================================================================
  // CONTENT
  // ==========================================================================
  
  definition: `
    Gradient Descent is an iterative optimization algorithm used to find the 
    minimum of a differentiable function. It works by repeatedly taking steps 
    in the direction of the negative gradient (steepest descent), with step 
    size controlled by the learning rate.
  `,

  intuition: `
    Imagine you're blindfolded on a mountain and want to reach the valley. 
    Gradient descent is like feeling the slope beneath your feet and always 
    walking downhill. The gradient tells you which direction is "downhill," 
    and the learning rate controls how big your steps are. Take steps that are 
    too large and you might overshoot the valley; too small and it takes forever.
  `,

  // ==========================================================================
  // MATHEMATICAL PROPERTIES
  // ==========================================================================
  
  properties: [
    'Follows the negative gradient: x_{t+1} = x_t - α∇f(x_t)',
    'Learning rate α controls step size',
    'Converges to local minimum (not always global)',
    'Requires differentiable objective function',
    'First-order optimization method (uses gradients, not Hessian)',
    'Convergence rate depends on function convexity and learning rate'
  ],

  // ==========================================================================
  // EXAMPLES
  // ==========================================================================
  
  examples: [
    {
      name: 'Simple Quadratic',
      description: 'Classic bowl-shaped function with clear global minimum',
      config: {
        functionType: 'quadratic',
        startPosition: { x: 3, y: 3 },
        learningRate: 0.1
      }
    },
    {
      name: 'Steep Valley',
      description: 'Elongated function showing importance of learning rate',
      config: {
        functionType: 'steep',
        startPosition: { x: 2, y: 4 },
        learningRate: 0.05
      }
    },
    {
      name: 'Non-convex',
      description: 'Multiple local minima - can get stuck',
      config: {
        functionType: 'non-convex',
        startPosition: { x: -2, y: 2 },
        learningRate: 0.1
      }
    },
    {
      name: 'Learning Rate Too High',
      description: 'Demonstrates divergence with excessive learning rate',
      config: {
        functionType: 'quadratic',
        startPosition: { x: 3, y: 3 },
        learningRate: 0.5
      }
    }
  ],

  // ==========================================================================
  // ML RELEVANCE
  // ==========================================================================
  
  mlRelevance: `
    Gradient Descent is the fundamental optimization algorithm in machine learning. 
    It's used to train neural networks (via backpropagation), linear regression, 
    logistic regression, and most other ML models. The "learning" in machine 
    learning literally means using gradient descent to minimize a loss function.
    
    Variants like Stochastic Gradient Descent (SGD), Mini-batch GD, Adam, and 
    RMSprop are the workhorses of deep learning, training models with billions 
    of parameters on massive datasets.
  `,

  applications: [
    'backpropagation',
    'linear-regression',
    'logistic-regression',
    'neural-networks',
    'deep-learning'
  ],

  // ==========================================================================
  // TEACHING NOTES
  // ==========================================================================
  
  teachingNotes: {
    commonMisconceptions: [
      'Gradient descent always finds the global minimum (only true for convex functions)',
      'Higher learning rate is always better (can cause divergence)',
      'The gradient points toward the minimum (it points away - hence negative gradient)',
      'Gradient descent works on any function (requires differentiability)'
    ],
    
    keyInsights: [
      'The learning rate is critical - too high diverges, too low is slow',
      'Starting position matters for non-convex functions',
      'The algorithm is greedy/local - only uses current gradient information',
      'Convergence guarantees require specific conditions (convexity, Lipschitz continuity)'
    ],
    
    interactiveExperiments: [
      'Adjust learning rate and watch convergence speed change',
      'Try different starting positions on non-convex functions',
      'Observe divergence with learning rate > 0.3',
      'Compare convergence on convex vs non-convex surfaces'
    ]
  },

  // ==========================================================================
  // ADDITIONAL METADATA
  // ==========================================================================
  
  metadata: {
    difficulty: 2,              // 1-5 scale
    estimatedTime: '15 mins',   // Time to understand the concept
    isAdvanced: false,
    
    tags: [
      'optimization',
      'iterative',
      'first-order',
      'machine-learning',
      'neural-networks',
      'training',
      'convergence',
      'learning-rate'
    ],
    
    prerequisites_explanation: {
      'vectors': 'Gradient descent operates in vector spaces',
      'functions': 'Must understand what we\'re optimizing',
      'gradient-rules': 'Core algorithm uses gradient computation',
      'differentiable-functions': 'Function must be differentiable'
    },
    
    realWorldApplications: [
      'Training neural networks for image recognition',
      'Optimizing logistics and supply chain routes',
      'Fitting models to financial data',
      'Calibrating robotics control systems',
      'Tuning recommendation system parameters'
    ],
    
    historicalContext: `
      Gradient descent dates back to Cauchy (1847) and was formalized by 
      Hadamard (1908). It became central to machine learning with the 
      development of backpropagation in the 1980s. Modern variants like 
      Adam (2014) have made it possible to train models with billions of 
      parameters.
    `,
    
    furtherReading: [
      {
        title: 'An Overview of Gradient Descent Optimization Algorithms',
        author: 'Sebastian Ruder',
        url: 'https://arxiv.org/abs/1609.04747',
        type: 'paper'
      },
      {
        title: 'Gradient Descent, How Neural Networks Learn',
        author: '3Blue1Brown',
        type: 'video'
      }
    ]
  },

  // ==========================================================================
  // CONCEPT CONNECTIONS
  // ==========================================================================
  
  conceptConnections: {
    buildsOn: {
      'gradient-rules': 'Uses gradient to determine descent direction',
      'vectors': 'Position and gradient are vectors in parameter space',
      'differentiable-functions': 'Requires smooth, differentiable objective'
    },
    
    leadsTo: {
      'backpropagation': 'Efficient gradient computation for neural networks',
      'stochastic-gradient-descent': 'Variant using random data samples',
      'adam-optimizer': 'Adaptive learning rate variant'
    },
    
    contrastedWith: {
      'newton-method': 'Second-order method (uses Hessian, faster but expensive)',
      'genetic-algorithms': 'Derivative-free optimization',
      'grid-search': 'Exhaustive search (no gradients needed)'
    }
  },

  // ==========================================================================
  // QUIZ/ASSESSMENT (optional for future features)
  // ==========================================================================
  
  assessmentQuestions: [
    {
      question: 'What happens if the learning rate is too high?',
      options: [
        'The algorithm converges faster',
        'The algorithm may diverge or oscillate',
        'The algorithm gets stuck in local minima',
        'Nothing changes'
      ],
      correctIndex: 1,
      explanation: 'A learning rate that is too high causes large steps that can overshoot the minimum, leading to divergence or oscillation around the minimum without converging.'
    },
    {
      question: 'Why do we use the negative gradient?',
      options: [
        'The gradient points toward the maximum',
        'The negative gradient points toward the minimum',
        'It makes the math easier',
        'The gradient is always negative'
      ],
      correctIndex: 1,
      explanation: 'The gradient points in the direction of steepest ascent (uphill). We want to go downhill to minimize the function, so we move in the negative gradient direction.'
    },
    {
      question: 'Does gradient descent guarantee finding the global minimum?',
      options: [
        'Yes, always',
        'Only for convex functions',
        'Only with the right learning rate',
        'No, never'
      ],
      correctIndex: 1,
      explanation: 'Gradient descent only guarantees finding the global minimum for convex functions. For non-convex functions, it may converge to a local minimum depending on the starting position.'
    }
  ]
};