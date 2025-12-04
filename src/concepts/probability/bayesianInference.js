/**
 * BAYESIAN INFERENCE CONCEPT
 * 
 * Statistical method for updating beliefs about parameters given evidence,
 * using Bayes' theorem to combine prior knowledge with observed data.
 * 
 * Layer: COMPUTATION
 * Domain: PROBABILITY
 */

import { LAYERS, DOMAINS } from '../../types/concept.js';
import { BayesianInference } from '../../components/BayesianInference.jsx';

export default {
  id: 'bayesian-inference',
  name: 'Bayesian Inference',
  layer: LAYERS.COMPUTATION,
  domain: DOMAINS.PROBABILITY,
  secondaryDomains: [DOMAINS.STATISTICS, DOMAINS.MACHINE_LEARNING],

  prerequisites: [
    'probability',
    'conditional-probability',
    'bayes-theorem',
    'probability-distributions'
  ],
  
  enables: [
    'bayesian-networks',
    'markov-chain-monte-carlo',
    'variational-inference',
    'bayesian-optimization'
  ],
  
  relatedConcepts: [
    'maximum-likelihood',
    'prior-posterior',
    'conjugate-priors',
    'credible-intervals'
  ],

  visualization: BayesianInference,

  definition: `
    Bayesian Inference is a method of statistical inference that updates 
    the probability for a hypothesis as more evidence becomes available. 
    It combines prior beliefs P(θ) with observed data likelihood P(D|θ) 
    to compute the posterior P(θ|D) = P(D|θ)P(θ)/P(D) using Bayes' theorem.
  `,

  intuition: `
    Imagine you're estimating a coin's fairness. You start with a prior 
    belief (maybe it's fair: 50% heads). Then you flip it 10 times and 
    see 7 heads. Bayesian inference updates your belief: "Given these 
    flips, what's the probability the coin has 60% heads? 70%?" The 
    posterior distribution shows your updated belief after seeing data.
  `,

  properties: [
    'Bayes\' Rule: P(θ|D) = P(D|θ)P(θ)/P(D)',
    'Prior P(θ): Initial belief before seeing data',
    'Likelihood P(D|θ): Probability of data given parameter',
    'Posterior P(θ|D): Updated belief after seeing data',
    'Conjugate priors: Analytical posterior computation',
    'Sequential updating: posterior becomes next prior'
  ],

  mlRelevance: `
    Bayesian methods provide:
    - Uncertainty quantification (not just point estimates)
    - Incorporation of domain knowledge (priors)
    - Robust learning with limited data
    - Foundation for Bayesian neural networks
    - Hyperparameter optimization (Bayesian optimization)
    - A/B testing and online learning
  `,

  metadata: {
    difficulty: 3,
    estimatedTime: '20 mins',
    isAdvanced: false,
    tags: ['bayesian', 'inference', 'prior', 'posterior', 'uncertainty']
  }
};