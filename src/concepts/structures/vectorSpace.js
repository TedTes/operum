/**
 * VECTOR SPACE CONCEPT
 * 
 * Fundamental algebraic structure where vectors can be added and scaled.
 * Forms the foundation for linear algebra and many ML concepts.
 * 
 * Layer: STRUCTURES
 * Domain: LINEAR_ALGEBRA
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { VectorSpaces } from '../../components/VectorSpaces.jsx';

export default {
  // ==========================================================================
  // METADATA
  // ==========================================================================
  
  id: 'vector-space',
  name: 'Vector Space',
  layer: LAYERS.STRUCTURES,
  domain: DOMAINS.LINEAR_ALGEBRA,
  secondaryDomains: [DOMAINS.MACHINE_LEARNING],

  // ==========================================================================
  // DEPENDENCIES
  // ==========================================================================
  
  prerequisites: [
    'vectors',           // Need to understand vector objects
    'scalar-field'       // Need scalars (real or complex numbers)
  ],
  
  enables: [
    'inner-product-space',    // Adds notion of angles/length
    'normed-space',           // Adds notion of magnitude
    'linear-transformation',  // Maps between vector spaces
    'basis',                  // Coordinate systems
    'dimension',              // Size of space
    'subspace',              // Subset that's also a vector space
    'linear-independence',    // Non-redundant vectors
    'span'                    // All reachable points
  ],
  
  relatedConcepts: [
    'linear-algebra',
    'vector-addition',
    'scalar-multiplication',
    'field'
  ],

  // ==========================================================================
  // VISUALIZATION
  // ==========================================================================
  
  visualization: VectorSpaces,

  // ==========================================================================
  // CONTENT
  // ==========================================================================
  
  definition: `
    A vector space (or linear space) is a set V of objects called vectors, 
    together with two operations: vector addition and scalar multiplication. 
    These operations must satisfy eight axioms that ensure the structure behaves 
    "linearly" - allowing us to combine vectors freely and predictably.
  `,

  intuition: `
    Think of a vector space as a "mathematical playground" where you can:
    1. Add any two vectors to get another vector (closure)
    2. Stretch or shrink vectors by multiplying by numbers (scaling)
    3. Move vectors around freely - there's an origin (zero vector)
    
    Examples you already know:
    - 2D plane (ℝ²): all points (x, y)
    - 3D space (ℝ³): all points (x, y, z)
    - Functions: you can add functions and scale them!
    - Polynomials: 3x² + 2x - 1 can be added/scaled
    
    The key insight: many mathematical objects form vector spaces, not just 
    arrows in space! This abstraction is powerful - any theorem about vector 
    spaces applies to ALL these examples.
  `,

  // ==========================================================================
  // AXIOMS (Critical for STRUCTURES layer)
  // ==========================================================================
  
  axioms: [
    'Closure under addition: u + v ∈ V for all u, v ∈ V',
    'Commutativity of addition: u + v = v + u',
    'Associativity of addition: (u + v) + w = u + (v + w)',
    'Identity element: ∃ 0 ∈ V such that v + 0 = v for all v ∈ V',
    'Inverse elements: For each v ∈ V, ∃ −v such that v + (−v) = 0',
    'Closure under scalar multiplication: c·v ∈ V for all c ∈ F, v ∈ V',
    'Distributivity over vector addition: c(u + v) = cu + cv',
    'Distributivity over scalar addition: (c + d)v = cv + dv',
    'Associativity of scalar multiplication: (cd)v = c(dv)',
    'Identity scalar: 1·v = v for all v ∈ V'
  ],

  // ==========================================================================
  // PROPERTIES
  // ==========================================================================
  
  properties: [
    'Zero vector is unique',
    'Additive inverse is unique for each vector',
    'Scalar multiplication by 0 gives zero vector: 0·v = 0',
    'Multiplication of zero vector: c·0 = 0',
    'If cv = 0, then either c = 0 or v = 0',
    'Cancellation law: u + w = v + w implies u = v',
    'Subspaces are vector spaces that inherit the structure'
  ],

  // ==========================================================================
  // EXAMPLES
  // ==========================================================================
  
  examples: [
    {
      name: 'ℝ² (2D Plane)',
      description: 'All pairs (x, y) of real numbers',
      details: 'Addition: (x₁, y₁) + (x₂, y₂) = (x₁+x₂, y₁+y₂). Scaling: c(x, y) = (cx, cy)',
      config: {
        dimension: 2,
        showGrid: true
      }
    },
    {
      name: 'ℝ³ (3D Space)',
      description: 'All triples (x, y, z) of real numbers',
      details: 'Standard 3D coordinate space',
      config: {
        dimension: 3,
        showGrid: true
      }
    },
    {
      name: 'Polynomials P₂',
      description: 'All polynomials of degree ≤ 2',
      details: 'Add: (a₀+a₁x+a₂x²) + (b₀+b₁x+b₂x²) = (a₀+b₀)+(a₁+b₁)x+(a₂+b₂)x²',
      isAbstract: true
    },
    {
      name: 'Function Space C[0,1]',
      description: 'All continuous functions on [0,1]',
      details: 'Add functions pointwise: (f+g)(x) = f(x) + g(x)',
      isAbstract: true
    },
    {
      name: 'Matrix Space M_{2×2}',
      description: 'All 2×2 matrices',
      details: 'Standard matrix addition and scalar multiplication',
      isAbstract: true
    },
    {
      name: 'Zero Space {0}',
      description: 'Only the zero vector',
      details: 'Trivial vector space - smallest possible',
      isAbstract: true
    }
  ],

  // ==========================================================================
  // ML RELEVANCE
  // ==========================================================================
  
  mlRelevance: `
    Vector spaces are THE foundational structure for machine learning:
    
    1. **Feature Spaces**: ML data lives in high-dimensional vector spaces. 
       Each data point is a vector, each feature is a dimension.
    
    2. **Model Parameters**: Neural network weights form a vector space. 
       Gradient descent moves through this space.
    
    3. **Embeddings**: Words, images, users become vectors in embedding spaces. 
       "King - Man + Woman ≈ Queen" works because of vector space structure.
    
    4. **Linear Models**: Linear regression, SVM, logistic regression all 
       operate on vector spaces using linear combinations.
    
    5. **Function Approximation**: Neural networks map from input vector space 
       to output vector space.
    
    6. **Convex Optimization**: Loss minimization happens in parameter vector spaces.
    
    Without vector spaces, we couldn't:
    - Represent data mathematically
    - Define gradients for optimization
    - Perform linear algebra operations
    - Measure similarity between data points
    - Transform features
  `,

  applications: [
    'linear-regression',
    'neural-networks',
    'word-embeddings',
    'pca',
    'svm',
    'feature-engineering'
  ],

  // ==========================================================================
  // TEACHING NOTES
  // ==========================================================================
  
  teachingNotes: {
    commonMisconceptions: [
      'Vectors are only arrows in space (false - functions, polynomials, matrices can be vectors)',
      'All sets of vectors form vector spaces (false - must satisfy all axioms)',
      'Vector spaces must be finite-dimensional (false - function spaces are infinite-dimensional)',
      'The zero vector is optional (false - it\'s required by the axioms)',
      'Vector spaces always involve real numbers (false - can be over complex numbers or other fields)'
    ],
    
    keyInsights: [
      'Vector space is an ABSTRACTION - defines what operations must exist, not what vectors "look like"',
      'The axioms are powerful - they guarantee predictable behavior',
      'Many different objects form vector spaces: ℝⁿ, functions, polynomials, matrices',
      'Subspaces inherit the vector space structure automatically',
      'Linear independence, basis, and dimension emerge from the vector space structure',
      'Every vector space has a zero vector (origin)'
    ],
    
    interactiveExperiments: [
      'Add two vectors and see closure (result is still in the space)',
      'Scale a vector and observe it stays in the space',
      'Try to find the zero vector (origin)',
      'Add a vector to its negative to get zero',
      'Form linear combinations and see the span',
      'Test commutativity: u + v = v + u'
    ],
    
    pedagogicalSequence: [
      '1. Start with concrete ℝ² and ℝ³ examples',
      '2. Show that axioms hold for familiar operations',
      '3. Introduce abstract examples (functions, polynomials)',
      '4. Emphasize: if axioms hold, it\'s a vector space, regardless of what vectors "are"',
      '5. Connect to ML: feature vectors, parameter spaces'
    ]
  },

  // ==========================================================================
  // ADDITIONAL METADATA
  // ==========================================================================
  
  metadata: {
    difficulty: 2,              // Foundational but accessible
    estimatedTime: '20 mins',   
    isAdvanced: false,
    
    tags: [
      'linear-algebra',
      'structure',
      'axioms',
      'abstract-algebra',
      'foundation',
      'vector-addition',
      'scalar-multiplication',
      'linear-combination'
    ],
    
    prerequisites_explanation: {
      'vectors': 'Need to understand what vectors are as objects',
      'scalar-field': 'Need scalars (numbers) to multiply vectors by'
    },
    
    realWorldApplications: [
      'Computer graphics (3D transformations)',
      'Physics (state spaces in quantum mechanics)',
      'Economics (commodity bundles, utility vectors)',
      'Signal processing (signal space)',
      'Machine learning (feature spaces, parameter spaces)',
      'Image processing (images as vectors of pixel intensities)'
    ],
    
    historicalContext: `
      The abstract concept of vector space was developed by Giuseppe Peano (1888) 
      and formalized in the early 20th century. Hermann Grassmann anticipated 
      many ideas in his 1844 work. The modern axiomatic treatment emerged in the 
      1920s-1930s with the development of functional analysis. This abstraction 
      unified many areas of mathematics and became foundational for quantum 
      mechanics and modern ML.
    `,
    
    furtherReading: [
      {
        title: 'Linear Algebra Done Right',
        author: 'Sheldon Axler',
        type: 'book'
      },
      {
        title: 'Essence of Linear Algebra',
        author: '3Blue1Brown',
        type: 'video-series'
      }
    ]
  },

  // ==========================================================================
  // CONCEPT CONNECTIONS
  // ==========================================================================
  
  conceptConnections: {
    buildsOn: {
      'vectors': 'Vectors are the objects we put structure on',
      'scalar-field': 'Need scalars for scalar multiplication operation'
    },
    
    leadsTo: {
      'inner-product-space': 'Adds dot product → angles, orthogonality',
      'normed-space': 'Adds notion of vector length/magnitude',
      'linear-transformation': 'Maps that preserve vector space structure',
      'basis': 'Minimal spanning set - coordinate system',
      'dimension': 'Size of the space (basis cardinality)'
    },
    
    specialCases: {
      'euclidean-space': 'ℝⁿ with standard addition and scaling',
      'function-space': 'Continuous functions form infinite-dimensional vector spaces',
      'polynomial-space': 'Polynomials of bounded degree'
    }
  },

  // ==========================================================================
  // MATHEMATICAL FORMULATION
  // ==========================================================================
  
  mathematicalFormulation: {
    definition: `
      A vector space over a field F is a set V together with:
      - Addition: + : V × V → V
      - Scalar multiplication: · : F × V → V
      
      Satisfying the 10 axioms listed above.
    `,
    
    notation: `
      - V denotes the vector space
      - F denotes the scalar field (usually ℝ or ℂ)
      - u, v, w ∈ V are vectors
      - c, d ∈ F are scalars
      - 0 ∈ V is the zero vector
      - dim(V) is the dimension
    `,
    
    basicTheorems: `
      **Theorem 1**: The zero vector is unique.
      **Theorem 2**: For each v ∈ V, the additive inverse −v is unique.
      **Theorem 3**: 0·v = 0 for all v ∈ V.
      **Theorem 4**: c·0 = 0 for all c ∈ F.
      **Theorem 5**: If cv = 0, then c = 0 or v = 0.
    `
  },

  // ==========================================================================
  // QUIZ/ASSESSMENT
  // ==========================================================================
  
  assessmentQuestions: [
    {
      question: 'Which of the following is NOT necessarily a vector space?',
      options: [
        'All 2×2 matrices with real entries',
        'All polynomials of degree ≤ 3',
        'All positive real numbers under standard addition',
        'All continuous functions on [0, 1]'
      ],
      correctIndex: 2,
      explanation: 'Positive real numbers fail the closure axiom: adding two positive numbers might give a negative result after subtracting (no additive inverse). Also, there\'s no zero vector (0 is not positive).'
    },
    {
      question: 'What makes a vector space a "space"?',
      options: [
        'It must be infinite',
        'It must have at least 2 dimensions',
        'It must satisfy the 10 axioms for addition and scalar multiplication',
        'It must contain arrows'
      ],
      correctIndex: 2,
      explanation: 'A vector space is defined entirely by satisfying the 10 axioms. The "space" terminology comes from the geometric intuition, but the abstract definition is what matters.'
    },
    {
      question: 'Can a single point {0} form a vector space?',
      options: [
        'No, vector spaces must have at least 2 vectors',
        'Yes, the zero space is the smallest vector space',
        'Only if we add more operations',
        'No, we need at least one dimension'
      ],
      correctIndex: 1,
      explanation: 'Yes! The set containing only the zero vector forms a vector space (the trivial or zero space). All axioms are satisfied: 0 + 0 = 0, c·0 = 0, etc.'
    },
    {
      question: 'Why are vector spaces important in machine learning?',
      options: [
        'They\'re not - ML uses matrices instead',
        'Data points, features, and parameters live in vector spaces',
        'Only for theoretical purposes, not practical applications',
        'They\'re only used in computer graphics'
      ],
      correctIndex: 1,
      explanation: 'Vector spaces are fundamental to ML: data points are vectors, model parameters form vector spaces, gradients live in parameter spaces, and virtually all ML operations are defined using vector space structure.'
    }
  ]
};