/**
 * LOGISTIC REGRESSION CONCEPT
 * 
 * Binary classification algorithm that models the probability of a binary outcome
 * using a logistic (sigmoid) function. Foundation of many ML classification tasks.
 * 
 * Layer: APPLICATIONS
 * Domain: MACHINE_LEARNING
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { LogisticRegression } from '../../components/LogisticRegression.jsx';

export default {
  // ==========================================================================
  // METADATA
  // ==========================================================================
  
  id: 'logistic-regression',
  name: 'Logistic Regression',
  layer: LAYERS.APPLICATIONS,
  domain: DOMAINS.MACHINE_LEARNING,
  secondaryDomains: [DOMAINS.STATISTICS, DOMAINS.OPTIMIZATION],

  // ==========================================================================
  // DEPENDENCIES
  // ==========================================================================
  
  prerequisites: [
    'vectors',                    // Data points are vectors
    'linear-transformation',      // Linear combination of features
    'sigmoid-function',           // Logistic function
    'gradient-descent',           // Training algorithm
    'probability',                // Models probabilities
    'maximum-likelihood'          // Training objective
  ],
  
  enables: [
    'neural-networks',            // Logistic regression is a single neuron
    'softmax-regression',         // Multi-class extension
    'deep-learning',              // Foundation of neural network layers
    'classification-metrics'      // Accuracy, precision, recall, etc.
  ],
  
  relatedConcepts: [
    'linear-regression',          // Linear counterpart
    'support-vector-machines',    // Alternative classifier
    'decision-boundaries',
    'cross-entropy-loss',
    'regularization'
  ],

  // ==========================================================================
  // VISUALIZATION
  // ==========================================================================
  
  visualization: LogisticRegression,

  // ==========================================================================
  // CONTENT
  // ==========================================================================
  
  definition: `
    Logistic Regression is a supervised learning algorithm for binary classification 
    that models the probability of a binary outcome (0 or 1) as a function of input 
    features. It applies a logistic (sigmoid) function to a linear combination of 
    features: P(y=1|x) = σ(w^T x + b), where σ(z) = 1/(1 + e^(-z)). Despite its name, 
    it's a classification algorithm, not regression.
  `,

  intuition: `
    Think of logistic regression as drawing a decision boundary to separate two 
    classes of data. Imagine classifying emails as spam/not-spam based on features 
    like word counts. Logistic regression:
    
    1. Combines your features linearly: z = w₁·(word_count) + w₂·(has_link) + b
    2. Squashes this to a probability using sigmoid: P(spam) = 1/(1 + e^(-z))
    3. If P > 0.5, predict "spam", else "not spam"
    
    The sigmoid function is key - it smoothly maps any real number to (0, 1), giving 
    us valid probabilities. The decision boundary is where P = 0.5, which is a 
    straight line (or hyperplane in higher dimensions). Training adjusts w and b 
    to position this boundary optimally.
    
    Why "logistic"? Because the log-odds (logit) is linear in x:
    log(P/(1-P)) = w^T x + b
  `,

  // ==========================================================================
  // MATHEMATICAL PROPERTIES
  // ==========================================================================
  
  properties: [
    'Model: P(y=1|x) = σ(w^T x + b) where σ(z) = 1/(1 + e^(-z))',
    'Decision boundary: {x : w^T x + b = 0} is a hyperplane',
    'Log-odds (logit) is linear: log(P/(1-P)) = w^T x + b',
    'Loss function: Binary Cross-Entropy L = -[y log(p) + (1-y)log(1-p)]',
    'Training: Minimize loss via gradient descent or Newton\'s method',
    'Probabilistic interpretation: Maximum Likelihood Estimation',
    'Output range: (0, 1) - valid probabilities',
    'Linearly separable classes → perfect separation (infinite weights)',
    'Non-linearly separable → soft boundary with classification errors',
    'Regularization (L1/L2) prevents overfitting and extreme weights'
  ],

  // ==========================================================================
  // EXAMPLES
  // ==========================================================================
  
  examples: [
    {
      name: 'Linearly Separable Classes',
      description: 'Two clearly separated clusters - easy classification',
      config: {
        dataPattern: 'separable',
        numPoints: 50,
        showBoundary: true
      }
    },
    {
      name: 'Overlapping Classes',
      description: 'Classes overlap - some misclassification inevitable',
      config: {
        dataPattern: 'overlapping',
        numPoints: 80,
        showBoundary: true,
        showProbabilities: true
      }
    },
    {
      name: 'XOR Pattern',
      description: 'Non-linearly separable - logistic regression fails',
      config: {
        dataPattern: 'xor',
        numPoints: 60,
        showBoundary: true,
        showLimitation: true
      }
    },
    {
      name: 'Real Dataset: Tumor Classification',
      description: 'Classify tumors as benign/malignant from features',
      config: {
        dataset: 'breast-cancer',
        features: ['size', 'texture']
      }
    }
  ],

  // ==========================================================================
  // ML RELEVANCE
  // ==========================================================================
  
  mlRelevance: `
    Logistic Regression is one of the most important algorithms in ML:
    
    1. **Foundation of Deep Learning**: A single neuron with sigmoid activation 
       IS logistic regression. Understanding this builds intuition for neural networks.
    
    2. **Production Workhorse**: Despite being "simple", logistic regression is 
       widely used in production for:
       - Click-through rate (CTR) prediction
       - Fraud detection
       - Medical diagnosis
       - Customer churn prediction
       - Spam filtering
    
    3. **Interpretability**: Coefficients w directly show feature importance, 
       making it valuable when explainability matters (healthcare, finance).
    
    4. **Probabilistic Output**: Unlike SVM or decision trees, gives calibrated 
       probabilities, not just binary predictions.
    
    5. **Fast and Scalable**: Efficient to train, works on large datasets, 
       online learning possible.
    
    6. **Baseline Model**: Often used as a baseline to compare more complex models 
       against. If neural network doesn't beat logistic regression, is it worth it?
    
    7. **Feature Engineering**: Forces you to think about good features, unlike 
       deep learning which learns features automatically.
  `,

  applications: [
    'spam-detection',
    'medical-diagnosis',
    'credit-scoring',
    'ad-click-prediction',
    'fraud-detection',
    'image-classification-simple',
    'sentiment-analysis',
    'customer-churn'
  ],

  // ==========================================================================
  // TEACHING NOTES
  // ==========================================================================
  
  teachingNotes: {
    commonMisconceptions: [
      'It\'s called "regression" but it\'s actually classification',
      'The sigmoid function is the only choice (false - logit link in GLM perspective)',
      'It always finds a perfect decision boundary (false - only if data is separable)',
      'It can handle non-linear boundaries (false - need feature engineering or kernel methods)',
      'Threshold must be 0.5 (false - can adjust based on cost of false positives/negatives)',
      'Output is the class label (false - output is probability, then threshold to get label)'
    ],
    
    keyInsights: [
      'Sigmoid squashes linear function to (0,1) → valid probabilities',
      'Decision boundary is linear (hyperplane) in feature space',
      'Training maximizes likelihood (equivalently, minimizes cross-entropy)',
      'It\'s a linear model with a non-linear activation',
      'Extension to multi-class: softmax regression',
      'Single neuron = logistic regression',
      'Regularization crucial to prevent overfitting on high-dimensional data'
    ],
    
    interactiveExperiments: [
      'Add points by clicking - watch decision boundary update',
      'Toggle between Class 0 and Class 1 to create different patterns',
      'Observe how overlapping classes lead to probabilistic predictions',
      'Try XOR pattern - see linear boundary fail',
      'Adjust learning rate and watch gradient descent converge',
      'Watch loss decrease during training',
      'See probability heatmap showing P(y=1) across space'
    ],
    
    connectionToNeuralNetworks: `
      Logistic regression IS a single-layer neural network with sigmoid activation:
      
      Input layer: x₁, x₂, ..., xₙ
              ↓ (weights w)
      Linear combination: z = w^T x + b
              ↓ (sigmoid activation)
      Output: ŷ = σ(z)
      
      Neural networks just stack many of these! Understanding logistic regression 
      deeply is understanding the building block of deep learning.
    `
  },

  // ==========================================================================
  // ADDITIONAL METADATA
  // ==========================================================================
  
  metadata: {
    difficulty: 2,              
    estimatedTime: '15 mins',   
    isAdvanced: false,
    
    tags: [
      'classification',
      'supervised-learning',
      'binary-classification',
      'sigmoid',
      'logit',
      'maximum-likelihood',
      'gradient-descent',
      'probabilistic',
      'interpretable',
      'linear-model'
    ],
    
    prerequisites_explanation: {
      'vectors': 'Data points and weights are vectors',
      'linear-transformation': 'z = w^T x + b is linear in x',
      'sigmoid-function': 'Core activation function',
      'gradient-descent': 'Training algorithm',
      'probability': 'Models P(y=1|x)',
      'maximum-likelihood': 'Training objective'
    },
    
    realWorldApplications: [
      'Gmail spam filter (early versions)',
      'Medical diagnosis (diabetes prediction, heart disease)',
      'Credit card fraud detection',
      'Online advertising (click prediction)',
      'Customer churn prediction (telecom, SaaS)',
      'Loan default prediction (banking)',
      'A/B testing analysis',
      'Weather prediction (rain/no rain)'
    ],
    
    historicalContext: `
      Logistic regression was developed by statistician David Cox in 1958, building 
      on earlier logit models. It became a staple of statistics and epidemiology. 
      With the ML boom in the 2000s, it was rediscovered as a simple yet powerful 
      classifier. It remains one of the most deployed algorithms in production ML 
      systems today, especially where interpretability matters.
    `,
    
    whenToUse: `
      Use Logistic Regression when:
      ✓ Binary classification problem
      ✓ Need interpretable model (feature importance)
      ✓ Need probability estimates, not just labels
      ✓ Linear decision boundary sufficient
      ✓ Fast training/inference required
      ✓ Limited data (won't overfit as easily as complex models)
      
      Consider alternatives when:
      ✗ Non-linear boundary needed (use kernels, trees, or neural nets)
      ✗ Multi-class with complex relationships (use softmax, trees, or deep learning)
      ✗ Very high-dimensional sparse data (use regularized variants)
    `,
    
    furtherReading: [
      {
        title: 'The Elements of Statistical Learning',
        author: 'Hastie, Tibshirani, Friedman',
        section: 'Chapter 4.4',
        type: 'book'
      },
      {
        title: 'Logistic Regression for Machine Learning',
        author: 'Jason Brownlee',
        type: 'article'
      }
    ]
  },

  // ==========================================================================
  // CONCEPT CONNECTIONS
  // ==========================================================================
  
  conceptConnections: {
    buildsOn: {
      'linear-regression': 'Similar linear model, but with sigmoid activation',
      'gradient-descent': 'Training algorithm',
      'sigmoid-function': 'Activation function that outputs probabilities',
      'maximum-likelihood': 'Training is MLE under Bernoulli assumption'
    },
    
    leadsTo: {
      'neural-networks': 'Logistic regression is a single neuron',
      'softmax-regression': 'Multi-class generalization',
      'deep-learning': 'Stack logistic units to build deep networks'
    },
    
    contrastedWith: {
      'linear-regression': 'Regression (continuous output) vs classification (binary)',
      'svm': 'Max-margin vs probabilistic approach',
      'naive-bayes': 'Discriminative vs generative model',
      'decision-trees': 'Non-linear boundaries vs linear'
    }
  },

  // ==========================================================================
  // MATHEMATICAL FORMULATION
  // ==========================================================================
  
  mathematicalFormulation: {
    model: `
      **Logistic Function (Sigmoid)**:
      σ(z) = 1 / (1 + e^(-z))
      
      **Model**:
      ŷ = P(y=1 | x; w, b) = σ(w^T x + b)
      
      **Decision Rule**:
      predict 1 if ŷ ≥ 0.5 (equivalently, if w^T x + b ≥ 0)
      predict 0 otherwise
    `,
    
    loss: `
      **Binary Cross-Entropy Loss** (Log Loss):
      
      L(w, b) = -(1/m) Σᵢ [yᵢ log(ŷᵢ) + (1-yᵢ)log(1-ŷᵢ)]
      
      Where:
      - m is number of training examples
      - yᵢ ∈ {0, 1} is true label
      - ŷᵢ = σ(w^T xᵢ + b) is predicted probability
      
      **Interpretation**: Negative log-likelihood of data under model.
    `,
    
    gradient: `
      **Gradient for Optimization**:
      
      ∂L/∂w = (1/m) Σᵢ (ŷᵢ - yᵢ) xᵢ
      ∂L/∂b = (1/m) Σᵢ (ŷᵢ - yᵢ)
      
      **Gradient Descent Update**:
      w := w - α (∂L/∂w)
      b := b - α (∂L/∂b)
    `,
    
    regularization: `
      **L2 Regularization** (Ridge):
      L_reg = L + (λ/2m) ||w||²
      
      **L1 Regularization** (Lasso):
      L_reg = L + (λ/m) ||w||₁
      
      Prevents overfitting, especially in high dimensions.
    `
  },

  // ==========================================================================
  // QUIZ/ASSESSMENT
  // ==========================================================================
  
  assessmentQuestions: [
    {
      question: 'Why is it called "Logistic Regression" even though it does classification?',
      options: [
        'It\'s a historical naming mistake',
        'It uses regression internally',
        'It outputs a continuous value (probability) before thresholding',
        'It was originally designed for regression'
      ],
      correctIndex: 2,
      explanation: 'The output is a continuous probability value between 0 and 1, which is then thresholded. The "regression" refers to modeling this continuous probability, even though the final task is classification.'
    },
    {
      question: 'What shape is the decision boundary in logistic regression?',
      options: [
        'Always a circle',
        'A curve defined by the sigmoid function',
        'A hyperplane (line in 2D, plane in 3D)',
        'It depends on the data'
      ],
      correctIndex: 2,
      explanation: 'The decision boundary is where w^T x + b = 0, which defines a hyperplane. It\'s linear in the feature space. The sigmoid function affects the probability, not the boundary shape.'
    },
    {
      question: 'How is logistic regression related to neural networks?',
      options: [
        'They are completely unrelated',
        'A single neuron with sigmoid activation IS logistic regression',
        'Neural networks replaced logistic regression',
        'Logistic regression is more complex than neural networks'
      ],
      correctIndex: 1,
      explanation: 'A single neuron with sigmoid activation is exactly logistic regression: linear combination followed by sigmoid. Neural networks stack many such units.'
    },
    {
      question: 'Can logistic regression handle non-linearly separable data perfectly?',
      options: [
        'Yes, by adjusting the learning rate',
        'Yes, by training longer',
        'No, the decision boundary is always linear',
        'Only with regularization'
      ],
      correctIndex: 2,
      explanation: 'Logistic regression\'s decision boundary is always linear (hyperplane). For non-linear boundaries, you need feature engineering, kernel methods, or non-linear models like neural networks.'
    }
  ]
};