/**
 * BACKPROPAGATION CONCEPT
 * 
 * Algorithm for efficiently computing gradients in neural networks by
 * applying the chain rule backwards through the network. The foundation
 * of modern deep learning training.
 * 
 * Layer: COMPUTATION
 * Domain: DEEP_LEARNING
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { Backpropagation } from '../../components/Backpropagation.jsx';

export default {
  // ==========================================================================
  // METADATA
  // ==========================================================================
  
  id: 'backpropagation',
  name: 'Backpropagation',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.DEEP_LEARNING,
  secondaryDomains: [DOMAINS.OPTIMIZATION, DOMAINS.CALCULUS],

  // ==========================================================================
  // DEPENDENCIES
  // ==========================================================================
  
  prerequisites: [
    'chain-rule',               // Core mathematical principle
    'gradient-descent',         // What backprop feeds into
    'neural-networks',          // What we're computing gradients for
    'computational-graphs',     // How operations are represented
    'partial-derivatives'       // Computing gradients
  ],
  
  enables: [
    'deep-learning',            // Enables training deep networks
    'convolutional-networks',   // CNNs trained via backprop
    'recurrent-networks',       // RNNs trained via backprop
    'transformers',             // Transformers trained via backprop
    'automatic-differentiation' // Generalized form (autograd)
  ],
  
  relatedConcepts: [
    'forward-propagation',
    'gradient-descent',
    'computational-graph',
    'automatic-differentiation',
    'vanishing-gradients',
    'exploding-gradients'
  ],

  // ==========================================================================
  // VISUALIZATION
  // ==========================================================================
  
  visualization: Backpropagation,

  // ==========================================================================
  // CONTENT
  // ==========================================================================
  
  definition: `
    Backpropagation (backward propagation of errors) is an efficient algorithm for 
    computing gradients of a loss function with respect to all weights in a neural 
    network. It applies the chain rule of calculus recursively, propagating error 
    signals backward from the output layer through hidden layers to the input layer. 
    This enables gradient descent to train multi-layer networks.
  `,

  intuition: `
    Imagine you're trying to improve a recipe (neural network) that transforms 
    ingredients (inputs) into a dish (output). After tasting (measuring loss), 
    you need to know: "If I change the amount of salt, how much better will it taste?"
    
    Backpropagation answers this for EVERY ingredient/step:
    
    1. **Forward pass**: Execute the recipe, record each step
       Input → Layer 1 → Layer 2 → Output → Loss
    
    2. **Backward pass**: Trace backwards asking "how did each step affect the loss?"
       - How much did output neuron affect loss? (dL/dz)
       - How much did Layer 2 weights affect output? (dL/dW2)
       - How much did Layer 1 affect Layer 2? (chain rule!)
       - How much did input weights affect Layer 1? (dL/dW1)
    
    The key insight: You don't need to test each ingredient separately (brute force). 
    The chain rule lets you compute all gradients in ONE backward pass, reusing 
    computations. This is why deep learning is computationally feasible.
    
    Without backprop, training a network with millions of parameters would be 
    impossibly slow. With backprop, it's just 2× slower than forward pass!
  `,

  // ==========================================================================
  // MATHEMATICAL PROPERTIES
  // ==========================================================================
  
  properties: [
    'Applies chain rule recursively: ∂L/∂wᵢ = (∂L/∂zₙ)(∂zₙ/∂zₙ₋₁)...(∂z₂/∂wᵢ)',
    'Computational efficiency: O(W) where W is number of weights (same as forward pass)',
    'Requires storing intermediate activations from forward pass',
    'Gradients flow backwards: output → hidden → input layers',
    'Each layer\'s gradient uses gradients from layer above (recursive)',
    'Works for any differentiable activation function',
    'Loss gradient with respect to weights: ∂L/∂W = δ · aᵀ',
    'Error signal δ propagates: δₗ = (Wₗ₊₁ᵀ δₗ₊₁) ⊙ σ\'(zₗ)',
    'Foundation of automatic differentiation systems (PyTorch, TensorFlow)',
    'Susceptible to vanishing/exploding gradients in deep networks'
  ],

  // ==========================================================================
  // EXAMPLES
  // ==========================================================================
  
  examples: [
    {
      name: 'Simple 2-Layer Network',
      description: 'Visualize gradient flow through 1 hidden layer',
      config: {
        architecture: [2, 3, 1],  // 2 inputs, 3 hidden, 1 output
        showSteps: true,
        highlightGradientFlow: true
      }
    },
    {
      name: 'Step-by-Step Computation',
      description: 'See each gradient calculation explicitly',
      config: {
        architecture: [2, 2, 1],
        stepByStep: true,
        showFormulas: true
      }
    },
    {
      name: 'Deep Network',
      description: 'Observe gradient flow through 4 layers',
      config: {
        architecture: [3, 4, 4, 3, 1],
        showGradientMagnitudes: true
      }
    },
    {
      name: 'Vanishing Gradients Demo',
      description: 'See gradients shrink in deeper layers with sigmoid',
      config: {
        architecture: [2, 3, 3, 3, 1],
        activation: 'sigmoid',
        highlightVanishing: true
      }
    }
  ],

  // ==========================================================================
  // ML RELEVANCE
  // ==========================================================================
  
  mlRelevance: `
    Backpropagation is THE algorithm that made deep learning possible:
    
    1. **Enables Training**: Without backprop, we couldn't train neural networks 
       with more than a few layers efficiently.
    
    2. **Computational Efficiency**: Computes ALL gradients in time proportional 
       to network size (linear), not exponential. This is a massive computational 
       win.
    
    3. **Universal Training Method**: Every deep learning framework (PyTorch, 
       TensorFlow, JAX) implements automatic differentiation based on backprop.
    
    4. **Gradient Descent Driver**: Backprop computes ∇L; gradient descent uses 
       it to update weights: w := w - α∇L.
    
    5. **Foundation of Modern AI**:
       - Image recognition (CNNs)
       - Language models (Transformers)
       - Game playing (AlphaGo)
       - All trained using backpropagation
    
    6. **Research Impact**: The rediscovery and popularization of backprop in 
       the 1980s sparked the neural network revolution. Modern deep learning 
       wouldn't exist without it.
    
    7. **Automatic Differentiation**: Modern frameworks abstract backprop into 
       "autograd" - define forward pass, get gradients automatically.
  `,

  applications: [
    'neural-networks',
    'convolutional-networks',
    'recurrent-networks',
    'transformers',
    'generative-adversarial-networks',
    'variational-autoencoders',
    'reinforcement-learning-policy-gradients'
  ],

  // ==========================================================================
  // TEACHING NOTES
  // ==========================================================================
  
  teachingNotes: {
    commonMisconceptions: [
      'Backprop is gradient descent (false - backprop computes gradients, GD uses them to update)',
      'Each weight\'s gradient requires separate forward pass (false - one backward pass gets all)',
      'Gradients flow forward (false - error signals propagate backward)',
      'Backprop changes weights (false - it only computes gradients; optimizer updates weights)',
      'It only works for feedforward networks (false - works for CNNs, RNNs, any differentiable graph)',
      'Modern frameworks don\'t use backprop (false - they use automatic differentiation, which generalizes backprop)'
    ],
    
    keyInsights: [
      'Backprop = Chain rule applied recursively',
      'One backward pass computes ALL gradients efficiently',
      'Requires storing activations from forward pass (memory-computation tradeoff)',
      'Error signal δ flows backward through network',
      'Each layer receives gradient from above, computes its own, passes it down',
      'Vanishing gradients occur when error signal shrinks through many layers',
      'ReLU activation helps prevent vanishing gradients (vs sigmoid/tanh)'
    ],
    
    interactiveExperiments: [
      'Step through forward pass, see activations computed',
      'Step through backward pass, see gradients propagate',
      'Observe gradient magnitudes at each layer',
      'Compare gradient flow with sigmoid vs ReLU',
      'Watch vanishing gradients in deep sigmoid network',
      'See how loss gradient ∂L/∂output starts the backward pass'
    ],
    
    pedagogicalSequence: [
      '1. Review chain rule: d(f∘g)/dx = f\'(g(x))·g\'(x)',
      '2. Show simple 1-layer example with explicit derivatives',
      '3. Introduce notation: δ = local gradient, ∂L/∂w = weight gradient',
      '4. Show recursive pattern: each layer uses gradient from layer above',
      '5. Generalize to arbitrary depth',
      '6. Connect to automatic differentiation'
    ],
    
    historicalNote: `
      Backpropagation was discovered multiple times:
      - 1960s: Basic ideas in control theory
      - 1974: Paul Werbos PhD thesis (mostly ignored)
      - 1986: Rumelhart, Hinton, Williams paper popularized it
      - 1990s: Slow adoption due to computational limits and vanishing gradients
      - 2012+: Renaissance with ReLU, GPUs, big data
      
      The algorithm's impact can't be overstated - it's the computational 
      foundation of the AI revolution.
    `
  },

  // ==========================================================================
  // ADDITIONAL METADATA
  // ==========================================================================
  
  metadata: {
    difficulty: 3,              
    estimatedTime: '25 mins',   
    isAdvanced: false,
    
    tags: [
      'deep-learning',
      'neural-networks',
      'optimization',
      'chain-rule',
      'gradients',
      'training',
      'automatic-differentiation',
      'computational-graph',
      'error-propagation'
    ],
    
    prerequisites_explanation: {
      'chain-rule': 'Core mathematical principle - backprop IS chain rule applied recursively',
      'gradient-descent': 'Backprop computes the gradients that GD uses',
      'neural-networks': 'Need to understand network structure and forward pass',
      'computational-graphs': 'Networks as graphs enable systematic gradient computation',
      'partial-derivatives': 'Need to compute ∂L/∂w for each weight'
    },
    
    realWorldApplications: [
      'Training all modern deep learning models',
      'GPT/BERT language models',
      'Image recognition (ResNet, Vision Transformers)',
      'AlphaGo and game-playing AI',
      'Autonomous driving perception systems',
      'Medical image analysis',
      'Speech recognition',
      'Recommendation systems'
    ],
    
    historicalContext: `
      Backpropagation was independently discovered multiple times:
      
      - 1960s: Kelley and Bryson (control theory)
      - 1974: Paul Werbos (PhD thesis, unnoticed)
      - 1986: Rumelhart, Hinton, Williams (Nature paper, popularized it)
      
      Despite its elegance, backprop wasn't widely adopted until the 2010s when:
      - ReLU solved vanishing gradients
      - GPUs enabled fast matrix operations
      - Big datasets became available
      - Better initialization methods emerged
      
      Today, every deep learning framework implements automatic differentiation,
      which generalizes backprop to arbitrary computational graphs.
    `,
    
    computationalComplexity: `
      **Time Complexity**: O(W) where W = number of weights
      - Forward pass: O(W) - compute activations
      - Backward pass: O(W) - compute gradients
      - Total: O(W) - linear in network size
      
      **Space Complexity**: O(A) where A = number of activations
      - Must store all activations from forward pass
      - Trade-off: gradient checkpointing reduces memory but increases computation
      
      **Comparison**: Without backprop, computing gradients naively would be 
      O(W²) or worse - backprop is a massive computational win.
    `,
    
    furtherReading: [
      {
        title: 'Learning representations by back-propagating errors',
        author: 'Rumelhart, Hinton, Williams',
        year: 1986,
        type: 'paper'
      },
      {
        title: 'Calculus on Computational Graphs: Backpropagation',
        author: 'Chris Olah',
        url: 'http://colah.github.io/posts/2015-08-Backprop/',
        type: 'blog'
      },
      {
        title: 'Yes you should understand backprop',
        author: 'Andrej Karpathy',
        type: 'article'
      }
    ]
  },

  // ==========================================================================
  // CONCEPT CONNECTIONS
  // ==========================================================================
  
  conceptConnections: {
    buildsOn: {
      'chain-rule': 'Backprop applies chain rule recursively through layers',
      'gradient-descent': 'Backprop computes the gradients GD needs',
      'neural-networks': 'Computes gradients for neural network weights',
      'computational-graphs': 'Networks as DAGs enable systematic gradient computation'
    },
    
    leadsTo: {
      'deep-learning': 'Makes training deep networks feasible',
      'automatic-differentiation': 'Generalized form in modern frameworks',
      'gradient-based-optimization': 'All variants need backprop gradients'
    },
    
    contrastedWith: {
      'finite-differences': 'Approximate gradients (slow, O(W²)) vs exact (fast, O(W))',
      'evolutionary-algorithms': 'Gradient-free optimization (slower for smooth functions)',
      'forward-mode-autodiff': 'Efficient for few outputs, many inputs (opposite of backprop)'
    }
  },

  // ==========================================================================
  // MATHEMATICAL FORMULATION
  // ==========================================================================
  
  mathematicalFormulation: {
    algorithm: `
      **Forward Pass** (store activations):
      For layer ℓ = 1 to L:
        zₗ = Wₗ aₗ₋₁ + bₗ      (pre-activation)
        aₗ = σ(zₗ)              (activation)
      
      **Backward Pass** (compute gradients):
      δL = ∇ₐL ⊙ σ'(zL)        (output layer error)
      
      For layer ℓ = L-1 down to 1:
        ∂L/∂Wₗ = δₗ aₗ₋₁ᵀ      (weight gradient)
        ∂L/∂bₗ = δₗ              (bias gradient)
        δₗ₋₁ = (Wₗᵀ δₗ) ⊙ σ'(zₗ₋₁)  (propagate error)
    `,
    
    chainRule: `
      **Chain Rule in Networks**:
      
      To compute ∂L/∂w₁ (weight in layer 1), chain through all layers:
      
      ∂L/∂w₁ = (∂L/∂a₃)(∂a₃/∂z₃)(∂z₃/∂a₂)(∂a₂/∂z₂)(∂z₂/∂a₁)(∂a₁/∂z₁)(∂z₁/∂w₁)
      
      Backprop efficiently computes this by reusing intermediate terms.
    `,
    
    vanishingGradients: `
      **Vanishing Gradient Problem**:
      
      In deep networks with sigmoid σ(z) = 1/(1+e^(-z)):
      - Derivative: σ'(z) = σ(z)(1-σ(z)) ≤ 0.25
      - After L layers: gradient ∝ (0.25)^L → exponential decay
      - Deep layers get tiny gradients, don't learn
      
      **Solutions**:
      - ReLU: σ'(z) = 1 for z > 0 (no saturation)
      - Residual connections (ResNet)
      - Careful initialization
      - Batch normalization
    `
  },

  // ==========================================================================
  // QUIZ/ASSESSMENT
  // ==========================================================================
  
  assessmentQuestions: [
    {
      question: 'What is the primary purpose of backpropagation?',
      options: [
        'To make predictions on new data',
        'To efficiently compute gradients of the loss with respect to all weights',
        'To update the weights of the network',
        'To initialize the weights randomly'
      ],
      correctIndex: 1,
      explanation: 'Backpropagation computes gradients efficiently. It doesn\'t make predictions (that\'s forward pass) or update weights (that\'s the optimizer like SGD). It just computes ∂L/∂w for every weight w.'
    },
    {
      question: 'Why is backpropagation computationally efficient?',
      options: [
        'It uses parallel processing',
        'It approximates gradients instead of computing them exactly',
        'It reuses intermediate computations via the chain rule',
        'It only computes gradients for important weights'
      ],
      correctIndex: 2,
      explanation: 'Backpropagation cleverly reuses intermediate gradient computations as it propagates backward through layers. This makes it O(W) instead of O(W²), a massive efficiency gain.'
    },
    {
      question: 'What causes the vanishing gradient problem?',
      options: [
        'Learning rate is too small',
        'Network is too shallow',
        'Activation derivatives (like sigmoid) are small, causing exponential decay in deep networks',
        'Too much training data'
      ],
      correctIndex: 2,
      explanation: 'Sigmoid activation has maximum derivative of 0.25. In deep networks, gradients multiply these small values across layers, causing exponential decay: (0.25)^L → 0 as L increases.'
    },
    {
      question: 'How does backpropagation relate to gradient descent?',
      options: [
        'They are the same algorithm',
        'Backpropagation computes gradients; gradient descent uses them to update weights',
        'Gradient descent computes gradients; backpropagation updates weights',
        'They are competing algorithms'
      ],
      correctIndex: 1,
      explanation: 'Backpropagation computes ∂L/∂w (the gradient). Gradient descent then uses this gradient to update: w := w - α(∂L/∂w). They work together: backprop provides gradients, GD uses them.'
    }
  ]
};