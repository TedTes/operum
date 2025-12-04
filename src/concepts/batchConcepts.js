/**
 * REMAINING CONCEPT DEFINITIONS (Commit 9)
 * 
 * This file contains streamlined concept definitions for all remaining
 * existing visualizations. These follow the established patterns but are
 * more concise since the patterns are now well-defined.
 */

import { LAYERS, DOMAINS } from '../types/concept.js';

// Import components
import { ConvexOptimization } from '../components/ConvexOptimization.jsx';
import { MonteCarlo } from '../components/MonteCarlo.jsx';
import { ActivationFunctions } from '../components/ActivationFunctions.jsx';
import { NeuralNetworkPlayground } from '../components/NeuralNetworkPlayground.jsx';
import { ConvolutionOperation } from '../components/ConvolutionOperation.jsx';
import { AttentionMechanism } from '../components/AttentionMechanism.jsx';

// ==========================================================================
// CONVEX OPTIMIZATION
// ==========================================================================

export const convexOptimization = {
  id: 'convex-optimization',
  name: 'Convex Optimization',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.OPTIMIZATION,
  
  prerequisites: ['functions', 'gradient-descent', 'convex-sets'],
  enables: ['linear-programming', 'quadratic-programming', 'svm'],
  relatedConcepts: ['gradient-descent', 'global-minimum', 'lagrange-multipliers'],
  
  visualization: ConvexOptimization,
  
  definition: `
    Convex Optimization deals with minimizing convex functions over convex sets.
    The key property: any local minimum is also a global minimum, making these
    problems tractable and reliably solvable.
  `,
  
  intuition: `
    A convex function is bowl-shaped - roll a ball down and it finds the global
    bottom. Non-convex functions have multiple valleys - the ball might get stuck.
    Convex optimization guarantees finding the best solution, not just a local one.
  `,
  
  properties: [
    'Local minimum = global minimum (key advantage)',
    'Gradient descent converges to optimal solution',
    'Many ML problems are convex (linear regression, SVM, logistic with convex loss)',
    'Efficient algorithms exist (interior point, gradient methods)',
    'Duality theory provides bounds and insights'
  ],
  
  mlRelevance: `
    Convex optimization underlies many ML algorithms: linear/logistic regression,
    SVM, Lasso, Ridge regression. Understanding convexity helps diagnose why some
    models train reliably while others (deep learning) need careful tuning.
  `,
  
  metadata: {
    difficulty: 3,
    estimatedTime: '20 mins',
    isAdvanced: false,
    tags: ['optimization', 'convex', 'global-minimum', 'convergence']
  }
};

// ==========================================================================
// MONTE CARLO
// ==========================================================================

export const monteCarlo = {
  id: 'monte-carlo',
  name: 'Monte Carlo Methods',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.PROBABILITY,
  
  prerequisites: ['probability', 'random-sampling', 'law-of-large-numbers'],
  enables: ['mcmc', 'importance-sampling', 'reinforcement-learning'],
  relatedConcepts: ['random-sampling', 'expectation', 'variance-reduction'],
  
  visualization: MonteCarlo,
  
  definition: `
    Monte Carlo methods use repeated random sampling to obtain numerical results.
    They're especially useful for computing expectations, integrals, and solving
    problems that are deterministic in principle but intractable analytically.
  `,
  
  intuition: `
    Want to estimate π? Randomly throw darts at a square with a circle inside.
    π/4 ≈ (darts in circle) / (total darts). More darts = better estimate.
    That's Monte Carlo: use randomness to approximate deterministic quantities.
  `,
  
  properties: [
    'Error decreases as 1/√N (N = number of samples)',
    'Works in high dimensions (curse of dimensionality less severe)',
    'Embarrassingly parallel (samples independent)',
    'Approximates expectations: E[f(X)] ≈ (1/N)Σf(xᵢ)',
    'Variance reduction techniques improve efficiency'
  ],
  
  mlRelevance: `
    Monte Carlo powers:
    - Reinforcement learning (policy evaluation, rollouts)
    - Bayesian inference (MCMC sampling)
    - Neural network training (dropout as sampling)
    - Simulation-based optimization
    - Uncertainty quantification
  `,
  
  metadata: {
    difficulty: 2,
    estimatedTime: '15 mins',
    isAdvanced: false,
    tags: ['monte-carlo', 'sampling', 'simulation', 'expectation']
  }
};

// ==========================================================================
// ACTIVATION FUNCTIONS
// ==========================================================================

export const activationFunctions = {
  id: 'activation-functions',
  name: 'Activation Functions',
  layer: LAYERS.RULES,
  domain: DOMAINS.DEEP_LEARNING,
  
  prerequisites: ['functions', 'derivatives', 'neural-networks'],
  enables: ['deep-learning', 'non-linearity', 'gradient-flow'],
  relatedConcepts: ['relu', 'sigmoid', 'tanh', 'vanishing-gradients'],
  
  visualization: ActivationFunctions,
  
  definition: `
    Activation functions introduce non-linearity into neural networks, enabling
    them to learn complex patterns. They transform the weighted sum of inputs
    into the neuron's output: a = σ(z) where z = w^T x + b.
  `,
  
  intuition: `
    Without activation functions, stacking layers does nothing - it's still 
    linear. ReLU(z) = max(0,z) adds a "kink" at zero. Sigmoid squashes to (0,1).
    These non-linearities let networks approximate any function (universal approximation).
  `,
  
  properties: [
    'ReLU: max(0, x) - most common, prevents vanishing gradients',
    'Sigmoid: 1/(1+e^(-x)) - outputs (0,1), used in output layers',
    'Tanh: hyperbolic tangent - outputs (-1,1), zero-centered',
    'Leaky ReLU: fixes "dying ReLU" problem',
    'Non-linearity enables learning complex functions',
    'Derivative matters for backpropagation'
  ],
  
  mlRelevance: `
    Choice of activation function dramatically affects training:
    - ReLU: default for hidden layers (fast, avoids vanishing gradients)
    - Sigmoid: binary classification output
    - Softmax: multi-class classification
    - Tanh: sometimes used in RNNs
    Modern networks: ReLU variants (Leaky ReLU, ELU, GELU)
  `,
  
  metadata: {
    difficulty: 2,
    estimatedTime: '15 mins',
    isAdvanced: false,
    tags: ['activation', 'non-linearity', 'relu', 'sigmoid', 'neural-networks']
  }
};

// ==========================================================================
// NEURAL NETWORK PLAYGROUND
// ==========================================================================

export const neuralNetworkPlayground = {
  id: 'neural-network-playground',
  name: 'Neural Network Playground',
  layer: LAYERS.APPLICATIONS,
  domain: DOMAINS.DEEP_LEARNING,
  
  prerequisites: [
    'neural-networks',
    'backpropagation',
    'activation-functions',
    'gradient-descent'
  ],
  enables: ['deep-learning', 'convolutional-networks', 'architecture-design'],
  relatedConcepts: ['layers', 'neurons', 'weights', 'training'],
  
  visualization: NeuralNetworkPlayground,
  
  definition: `
    An interactive environment for building and training neural networks from
    scratch. Adjust architecture, learning rate, activation functions, and
    watch the network learn decision boundaries in real-time.
  `,
  
  intuition: `
    Like LEGO for neural networks! Add layers, change neuron counts, pick
    activations, and see how the network learns. Watch decision boundaries
    evolve during training. Experiment to build intuition for why deeper
    networks learn more complex patterns.
  `,
  
  properties: [
    'Interactive architecture design',
    'Real-time training visualization',
    'Multiple dataset patterns (linear, XOR, spiral)',
    'Adjustable hyperparameters',
    'Live decision boundary plotting',
    'Performance metrics tracking'
  ],
  
  mlRelevance: `
    Playground environments teach:
    - How network depth affects expressiveness
    - Why XOR needs hidden layers
    - Impact of learning rate on convergence
    - Role of activation functions
    - Overfitting vs underfitting
    Foundation for understanding production deep learning.
  `,
  
  metadata: {
    difficulty: 2,
    estimatedTime: '20 mins',
    isAdvanced: false,
    tags: ['neural-networks', 'interactive', 'playground', 'architecture']
  }
};

// ==========================================================================
// CONVOLUTION OPERATION
// ==========================================================================

export const convolutionOperation = {
  id: 'convolution-operation',
  name: 'Convolution Operation',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.DEEP_LEARNING,
  
  prerequisites: ['matrices', 'linear-transformation', 'filters'],
  enables: ['convolutional-networks', 'image-processing', 'computer-vision'],
  relatedConcepts: ['kernels', 'feature-maps', 'stride', 'padding'],
  
  visualization: ConvolutionOperation,
  
  definition: `
    Convolution is a mathematical operation that slides a filter (kernel) over
    an input (e.g., image) and computes dot products at each position, producing
    a feature map. It's the fundamental operation in CNNs.
  `,
  
  intuition: `
    Imagine a magnifying glass (filter) sliding over a picture. At each spot,
    you compute: pixel×weight + pixel×weight + ... The filter learns WHAT to
    look for (edges? textures?). Early layers detect simple patterns, deeper
    layers combine them into complex objects.
  `,
  
  properties: [
    'Operation: (I * K)[i,j] = ΣΣ I[i+m, j+n] · K[m,n]',
    'Kernel/filter: small learnable weight matrix',
    'Stride: step size (stride=2 halves dimensions)',
    'Padding: border pixels (maintains size)',
    'Feature map: output after convolution',
    'Parameter sharing: same filter across entire input',
    'Translation invariance: detects features anywhere'
  ],
  
  mlRelevance: `
    Convolution powers computer vision:
    - CNNs (AlexNet, ResNet, Vision Transformers)
    - Image classification, object detection
    - Face recognition, medical imaging
    - Self-driving car perception
    Understanding convolution = understanding how machines "see"
  `,
  
  metadata: {
    difficulty: 2,
    estimatedTime: '15 mins',
    isAdvanced: false,
    tags: ['convolution', 'cnn', 'image-processing', 'filters', 'computer-vision']
  }
};

// ==========================================================================
// ATTENTION MECHANISM
// ==========================================================================

export const attentionMechanism = {
  id: 'attention-mechanism',
  name: 'Attention Mechanism',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.DEEP_LEARNING,
  
  prerequisites: [
    'vectors',
    'dot-product',
    'softmax',
    'neural-networks'
  ],
  enables: ['transformers', 'self-attention', 'multi-head-attention', 'bert', 'gpt'],
  relatedConcepts: ['query-key-value', 'transformers', 'sequence-modeling'],
  
  visualization: AttentionMechanism,
  
  definition: `
    Attention allows a model to dynamically focus on relevant parts of the input.
    Each position computes attention scores with all other positions using
    Query-Key-Value mechanism: Attention(Q,K,V) = softmax(QK^T/√d)V.
  `,
  
  intuition: `
    Reading "The animal didn't cross the street because IT was too tired."
    What does "IT" refer to? Your brain attends to "animal" (not "street").
    Attention in neural networks does this: each word looks at all other words
    and decides which are most relevant. Q=what I'm looking for, K=what I
    contain, V=what I output.
  `,
  
  properties: [
    'Query (Q): "what am I looking for?"',
    'Key (K): "what do I contain?"',
    'Value (V): "what should I output?"',
    'Score: Q·K (similarity between query and key)',
    'Softmax: normalize scores to attention weights',
    'Output: weighted sum of values',
    'Self-attention: Q,K,V from same sequence',
    'Multi-head: multiple attention patterns learned in parallel'
  ],
  
  mlRelevance: `
    "Attention is All You Need" (2017) revolutionized AI:
    - GPT, BERT, T5: all transformers using attention
    - Image processing: Vision Transformers
    - Protein folding: AlphaFold2
    - Speech recognition: Whisper
    Every major AI breakthrough since 2017 uses attention. It's THE core
    innovation enabling large language models.
  `,
  
  applications: [
    'transformers',
    'gpt',
    'bert',
    'vision-transformers',
    'machine-translation'
  ],
  
  metadata: {
    difficulty: 3,
    estimatedTime: '25 mins',
    isAdvanced: false,
    tags: ['attention', 'transformers', 'query-key-value', 'self-attention', 'nlp']
  }
};

// ==========================================================================
// EXPORT ALL
// ==========================================================================

export default {
  convexOptimization,
  monteCarlo,
  activationFunctions,
  neuralNetworkPlayground,
  convolutionOperation,
  attentionMechanism
};