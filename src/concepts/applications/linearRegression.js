/**
 * LINEAR REGRESSION CONCEPT
 * 
 * Fundamental supervised learning algorithm that models linear relationships
 * between variables by fitting a line (or hyperplane) to data.
 * 
 * Layer: APPLICATIONS
 * Domain: MACHINE_LEARNING
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { LinearRegression } from '../../components/LinearRegression.jsx';

export default {
  id: 'linear-regression',
  name: 'Linear Regression',
  layer: LAYERS.APPLICATIONS,
  domain: DOMAINS.MACHINE_LEARNING,
  secondaryDomains: [DOMAINS.STATISTICS],

  prerequisites: [
    'vectors',
    'linear-transformation',
    'least-squares',
    'gradient-descent'
  ],
  
  enables: [
    'multiple-regression',
    'polynomial-regression',
    'regularization',
    'neural-networks'
  ],
  
  relatedConcepts: [
    'logistic-regression',
    'gradient-descent',
    'residuals',
    'r-squared'
  ],

  visualization: LinearRegression,

  definition: `
    Linear Regression models the relationship between a dependent variable y 
    and one or more independent variables x by fitting a linear equation: 
    y = mx + b (simple) or y = w^T x + b (multiple). The model minimizes 
    the sum of squared residuals (least squares method) to find the best-fitting line.
  `,

  intuition: `
    Imagine trying to predict house prices from square footage. You plot 
    points (size, price) and draw the "best" line through them. That line 
    is linear regression. The slope tells you "each additional sq ft adds 
    $X to price." The intercept is the base price. Residuals (vertical 
    distances from points to line) measure errors - minimize their squares 
    to get the best fit.
  `,

  properties: [
    'Model: y = w^T x + b',
    'Objective: Minimize Σ(yᵢ - ŷᵢ)² (sum of squared residuals)',
    'Closed-form solution: w = (X^T X)^(-1) X^T y (Normal Equation)',
    'Gradient-based: Can use gradient descent for large datasets',
    'R² measures goodness of fit (0 = bad, 1 = perfect)',
    'Assumptions: linearity, independence, homoscedasticity, normality'
  ],

  mlRelevance: `
    Linear regression is the simplest ML algorithm and a foundation for understanding:
    - How models learn from data (minimize loss)
    - Gradient descent (training algorithm)
    - Feature engineering (transforming inputs)
    - Model evaluation (R², RMSE)
    - Overfitting and regularization
    
    Used in practice for: sales forecasting, trend analysis, risk assessment,
    price prediction, and as baselines to compare complex models against.
  `,

  applications: [
    'sales-forecasting',
    'price-prediction',
    'trend-analysis',
    'risk-assessment'
  ],

  metadata: {
    difficulty: 1,
    estimatedTime: '15 mins',
    isAdvanced: false,
    tags: ['regression', 'supervised-learning', 'least-squares', 'baseline-model']
  }
};