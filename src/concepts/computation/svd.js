/**
 * SINGULAR VALUE DECOMPOSITION (SVD) CONCEPT
 * 
 * Matrix factorization that decomposes any matrix into three components:
 * rotation, scaling, and rotation. Fundamental for dimensionality reduction.
 * 
 * Layer: COMPUTATION
 * Domain: LINEAR_ALGEBRA
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { SVD } from '../../components/SVD.jsx';

export default {
  // ==========================================================================
  // METADATA
  // ==========================================================================
  
  id: 'svd',
  name: 'Singular Value Decomposition (SVD)',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.LINEAR_ALGEBRA,
  secondaryDomains: [DOMAINS.MACHINE_LEARNING],

  // ==========================================================================
  // DEPENDENCIES
  // ==========================================================================
  
  prerequisites: [
    'matrices',              // Need to understand matrices
    'vector-space',          // SVD operates on vector spaces
    'linear-transformation', // Matrix as linear transformation
    'eigenvalues'            // Related to eigendecomposition
  ],
  
  enables: [
    'pca',                   // PCA is SVD on covariance matrix
    'matrix-approximation',  // Low-rank approximations
    'image-compression',     // Lossy image compression
    'recommender-systems',   // Collaborative filtering
    'latent-semantic-analysis'
  ],
  
  relatedConcepts: [
    'eigendecomposition',
    'matrix-rank',
    'orthogonal-matrices',
    'dimensionality-reduction'
  ],

  // ==========================================================================
  // VISUALIZATION
  // ==========================================================================
  
  visualization: SVD,

  // ==========================================================================
  // CONTENT
  // ==========================================================================
  
  definition: `
    Singular Value Decomposition (SVD) factorizes any m×n matrix A into three 
    matrices: A = UΣV^T, where U and V are orthogonal matrices containing left 
    and right singular vectors, and Σ is a diagonal matrix of singular values 
    (non-negative, in descending order). This decomposition reveals the 
    fundamental structure and rank of the matrix.
  `,

  intuition: `
    Think of SVD as "understanding what a matrix does" by breaking it into three 
    simple steps: (1) rotate to align with principal axes (V^T), (2) scale along 
    those axes (Σ), (3) rotate to final orientation (U). The singular values tell 
    you how much stretching happens in each direction - large values mean important 
    directions, small values mean redundant information. By keeping only the largest 
    singular values, you get the "best" approximation of the original matrix with 
    fewer numbers - this is how image compression works!
  `,

  // ==========================================================================
  // MATHEMATICAL PROPERTIES
  // ==========================================================================
  
  properties: [
    'Factorization: A = UΣV^T (or A = UΣV* for complex matrices)',
    'U is m×m orthogonal (U^T U = I), columns are left singular vectors',
    'V is n×n orthogonal (V^T V = I), columns are right singular vectors',
    'Σ is m×n diagonal with singular values σ₁ ≥ σ₂ ≥ ... ≥ σᵣ ≥ 0',
    'Rank of A equals number of non-zero singular values',
    'Best rank-k approximation: A_k = U_k Σ_k V_k^T minimizes ||A - A_k||',
    'Works for any matrix (not just square, symmetric, or invertible)',
    'Singular values are square roots of eigenvalues of A^T A (or AA^T)',
    'Left singular vectors are eigenvectors of AA^T',
    'Right singular vectors are eigenvectors of A^T A'
  ],

  // ==========================================================================
  // EXAMPLES
  // ==========================================================================
  
  examples: [
    {
      name: 'Full Rank Matrix',
      description: 'All singular values are significant',
      config: {
        matrix: [[3, 1], [1, 2]],
        rank: 2
      }
    },
    {
      name: 'Low Rank Approximation',
      description: 'Keep only largest singular value (90% compression)',
      config: {
        matrix: [[4, 2], [2, 1]],
        rank: 1
      }
    },
    {
      name: 'Image Compression',
      description: 'Approximate image with k=5 components instead of full rank',
      config: {
        useImageExample: true,
        rank: 5
      }
    },
    {
      name: 'Near-Singular Matrix',
      description: 'One very small singular value indicates near-redundancy',
      config: {
        matrix: [[1, 1.01], [1, 1]],
        rank: 2
      }
    }
  ],

  // ==========================================================================
  // ML RELEVANCE
  // ==========================================================================
  
  mlRelevance: `
    SVD is foundational in machine learning and data science:
    
    1. **PCA (Principal Component Analysis)**: PCA is literally SVD applied to 
       centered data. The right singular vectors are the principal components.
    
    2. **Dimensionality Reduction**: Keep only the top-k singular values to 
       reduce data from high dimensions to k dimensions while preserving variance.
    
    3. **Recommender Systems**: Netflix Prize winner used SVD for collaborative 
       filtering - decompose user-item matrix to find latent factors.
    
    4. **Image Compression**: JPEG uses a variant of SVD. Keep largest singular 
       values, discard small ones.
    
    5. **Natural Language Processing**: Latent Semantic Analysis uses SVD to 
       find topics in document-term matrices.
    
    6. **Noise Reduction**: Small singular values often represent noise - 
       truncated SVD removes noise.
    
    7. **Pseudoinverse**: Moore-Penrose pseudoinverse A^+ = VΣ^+U^T for solving 
       least squares problems.
  `,

  applications: [
    'pca',
    'image-compression',
    'recommender-systems',
    'latent-semantic-analysis',
    'matrix-completion',
    'noise-reduction'
  ],

  // ==========================================================================
  // TEACHING NOTES
  // ==========================================================================
  
  teachingNotes: {
    commonMisconceptions: [
      'SVD only works for square matrices (false - works for any m×n matrix)',
      'SVD is the same as eigendecomposition (related but different - eigendecomp only for square matrices)',
      'Singular values can be negative (false - always non-negative by definition)',
      'All matrices have the same number of singular values (false - rank determines number of non-zero singular values)',
      'SVD is only theoretical (false - used extensively in practice for compression, ML, etc.)'
    ],
    
    keyInsights: [
      'SVD works on ANY matrix - non-square, singular, rectangular',
      'Singular values ordered by importance - truncate to approximate',
      'Optimal low-rank approximation (Eckart-Young theorem)',
      'Geometric interpretation: rotate → scale → rotate',
      'Connection to PCA: right singular vectors = principal components',
      'Rank = number of non-zero singular values'
    ],
    
    interactiveExperiments: [
      'Adjust rank slider to see compression vs. accuracy tradeoff',
      'Watch animation showing U, Σ, V^T decomposition steps',
      'Compare full rank vs. rank-1 approximation',
      'Observe how small singular values contribute little to reconstruction',
      'Try different matrices and see singular value patterns'
    ]
  },

  // ==========================================================================
  // ADDITIONAL METADATA
  // ==========================================================================
  
  metadata: {
    difficulty: 3,              // 1-5 scale (moderate difficulty)
    estimatedTime: '20 mins',   
    isAdvanced: false,
    
    tags: [
      'linear-algebra',
      'matrix-decomposition',
      'dimensionality-reduction',
      'pca',
      'compression',
      'factorization',
      'orthogonal',
      'singular-values',
      'rank'
    ],
    
    prerequisites_explanation: {
      'matrices': 'SVD decomposes matrices',
      'vector-space': 'Operates on vector spaces',
      'linear-transformation': 'Matrix represents a transformation being decomposed',
      'eigenvalues': 'Singular values related to eigenvalues of A^T A'
    },
    
    realWorldApplications: [
      'Netflix recommendation algorithm (collaborative filtering)',
      'Image compression (JPEG-like compression)',
      'Google PageRank (early versions)',
      'Face recognition (eigenfaces)',
      'Document search (latent semantic analysis)',
      'Noise filtering in data preprocessing',
      'Solving overdetermined linear systems'
    ],
    
    historicalContext: `
      SVD was independently discovered by Beltrami (1873) and Jordan (1874), 
      with modern computational algorithms developed by Gene Golub in the 1960s. 
      It became central to machine learning in the 2000s, especially after the 
      Netflix Prize (2006-2009) where SVD-based methods dominated. Today, it's 
      one of the most important algorithms in numerical linear algebra and data 
      science.
    `,
    
    computationalNotes: `
      Computing SVD is expensive: O(mn²) for m×n matrix where m ≥ n. For large 
      matrices, randomized SVD and truncated SVD algorithms provide faster 
      approximations. Libraries like NumPy, LAPACK, and TensorFlow have optimized 
      implementations.
    `,
    
    furtherReading: [
      {
        title: 'We Recommend a Singular Value Decomposition',
        author: 'David Austin',
        url: 'http://www.ams.org/samplings/feature-column/fcarc-svd',
        type: 'article'
      },
      {
        title: 'Singular Value Decomposition Tutorial',
        author: 'Kirk Baker',
        type: 'paper'
      },
      {
        title: 'The Extraordinary SVD',
        author: 'Kalman, Dan',
        type: 'paper'
      }
    ]
  },

  // ==========================================================================
  // CONCEPT CONNECTIONS
  // ==========================================================================
  
  conceptConnections: {
    buildsOn: {
      'matrices': 'Operates on matrix objects',
      'vector-space': 'Singular vectors form orthonormal bases',
      'linear-transformation': 'Decomposes any linear transformation',
      'eigenvalues': 'Singular values are sqrt of eigenvalues of A^T A'
    },
    
    leadsTo: {
      'pca': 'PCA is SVD of centered data matrix',
      'matrix-approximation': 'Truncated SVD gives best low-rank approximation',
      'pseudoinverse': 'Moore-Penrose inverse computed via SVD',
      'matrix-completion': 'Netflix problem - fill missing matrix entries'
    },
    
    contrastedWith: {
      'eigendecomposition': 'Works only for square matrices; SVD works for any matrix',
      'qr-decomposition': 'Different factorization (orthogonal × triangular)',
      'lu-decomposition': 'Lower × Upper, used for solving linear systems'
    }
  },

  // ==========================================================================
  // MATHEMATICAL FORMULATION
  // ==========================================================================
  
  mathematicalFormulation: {
    theorem: `
      **Singular Value Decomposition Theorem**
      
      For any real m×n matrix A, there exist:
      - Orthogonal matrix U ∈ ℝ^(m×m)
      - Diagonal matrix Σ ∈ ℝ^(m×n) with σ₁ ≥ σ₂ ≥ ... ≥ σₘᵢₙ₍ₘ,ₙ₎ ≥ 0
      - Orthogonal matrix V ∈ ℝ^(n×n)
      
      Such that: A = UΣV^T
    `,
    
    computation: `
      To compute SVD:
      1. Form A^T A (n×n symmetric matrix)
      2. Compute eigenvalues λ₁, ..., λₙ and eigenvectors of A^T A
      3. Singular values: σᵢ = √λᵢ
      4. Right singular vectors: columns of V are eigenvectors of A^T A
      5. Left singular vectors: uᵢ = (1/σᵢ)Avᵢ
    `,
    
    optimalApproximation: `
      **Eckart-Young Theorem**
      
      The best rank-k approximation of A in Frobenius norm is:
      
      A_k = Σᵢ₌₁ᵏ σᵢ uᵢ vᵢ^T
      
      This minimizes ||A - A_k||_F over all rank-k matrices.
    `
  },

  // ==========================================================================
  // QUIZ/ASSESSMENT
  // ==========================================================================
  
  assessmentQuestions: [
    {
      question: 'What does the rank of a matrix equal in terms of SVD?',
      options: [
        'The number of rows',
        'The number of columns',
        'The number of non-zero singular values',
        'The largest singular value'
      ],
      correctIndex: 2,
      explanation: 'The rank of a matrix equals the number of non-zero singular values in its SVD. This is one of the key insights of SVD - it directly reveals the rank.'
    },
    {
      question: 'Can SVD be applied to non-square matrices?',
      options: [
        'No, only square matrices',
        'Yes, any m×n matrix',
        'Only if m = n or m = 2n',
        'Only if the matrix is invertible'
      ],
      correctIndex: 1,
      explanation: 'SVD works for ANY m×n matrix, whether square, tall (m>n), or wide (m<n). This is a major advantage over eigendecomposition which requires square matrices.'
    },
    {
      question: 'How does truncated SVD achieve compression?',
      options: [
        'By removing random elements',
        'By keeping only the largest k singular values and their vectors',
        'By rounding all values to integers',
        'By removing duplicate rows'
      ],
      correctIndex: 1,
      explanation: 'Truncated SVD keeps only the k largest singular values and their corresponding singular vectors. This gives the optimal rank-k approximation, effectively compressing the data.'
    },
    {
      question: 'What is the relationship between SVD and PCA?',
      options: [
        'They are completely unrelated',
        'PCA is SVD applied to centered data',
        'SVD is a special case of PCA',
        'They always give different results'
      ],
      correctIndex: 1,
      explanation: 'PCA is literally SVD applied to centered data (data with mean subtracted). The right singular vectors from SVD are the principal components in PCA.'
    }
  ]
};