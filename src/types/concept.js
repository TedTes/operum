/**
 * CONCEPT SCHEMA & TYPE DEFINITIONS
 * 
 * This file defines the structure for all mathematical concepts in the Applied Math Lab.
 * Every concept (from Objects to Applications) follows this schema for consistency.
 */

// ============================================================================
// LAYER DEFINITIONS
// ============================================================================

/**
 * The five conceptual layers in the mathematical hierarchy
 */
export const LAYERS = {
    OBJECTS: 'objects',
    STRUCTURES: 'structures',
    RULES: 'rules',
    COMPUTATION: 'computation',
    APPLICATIONS: 'applications'
  };
  
  /**
   * Human-readable layer names
   */
  export const LAYER_NAMES = {
    [LAYERS.OBJECTS]: 'Objects',
    [LAYERS.STRUCTURES]: 'Structures',
    [LAYERS.RULES]: 'Rules',
    [LAYERS.COMPUTATION]: 'Computation',
    [LAYERS.APPLICATIONS]: 'Applications'
  };
  
  /**
   * Layer descriptions
   */
  export const LAYER_DESCRIPTIONS = {
    [LAYERS.OBJECTS]: 'Raw mathematical entities with no inherent structure',
    [LAYERS.STRUCTURES]: 'Rules and relations that give meaning to objects',
    [LAYERS.RULES]: 'Axioms and laws that constrain how structures behave',
    [LAYERS.COMPUTATION]: 'Algorithms that apply rules to produce dynamic behavior',
    [LAYERS.APPLICATIONS]: 'AI/ML models and real-world implementations'
  };
  
  // ============================================================================
  // DOMAIN DEFINITIONS
  // ============================================================================
  
  /**
   * Mathematical domains for organizing concepts
   */
  export const DOMAINS = {
    LINEAR_ALGEBRA: 'linear-algebra',
    CALCULUS: 'calculus',
    PROBABILITY: 'probability',
    STATISTICS: 'statistics',
    OPTIMIZATION: 'optimization',
    TOPOLOGY: 'topology',
    GEOMETRY: 'geometry',
    INFORMATION_THEORY: 'information-theory',
    MACHINE_LEARNING: 'machine-learning',
    DEEP_LEARNING: 'deep-learning'
  };
  
  /**
   * Human-readable domain names
   */
  export const DOMAIN_NAMES = {
    [DOMAINS.LINEAR_ALGEBRA]: 'Linear Algebra',
    [DOMAINS.CALCULUS]: 'Calculus',
    [DOMAINS.PROBABILITY]: 'Probability',
    [DOMAINS.STATISTICS]: 'Statistics',
    [DOMAINS.OPTIMIZATION]: 'Optimization',
    [DOMAINS.TOPOLOGY]: 'Topology',
    [DOMAINS.GEOMETRY]: 'Geometry',
    [DOMAINS.INFORMATION_THEORY]: 'Information Theory',
    [DOMAINS.MACHINE_LEARNING]: 'Machine Learning',
    [DOMAINS.DEEP_LEARNING]: 'Deep Learning'
  };
  
  // ============================================================================
  // CONCEPT SCHEMA
  // ============================================================================
  
  /**
   * Core concept structure that all concepts must follow
   * 
   * @typedef {Object} Concept
   * 
   * @property {string} id - Unique identifier (kebab-case, e.g., 'gradient-descent')
   * @property {string} name - Human-readable name (e.g., 'Gradient Descent')
   * @property {string} layer - One of LAYERS enum values
   * @property {string} domain - Primary domain (one of DOMAINS enum values)
   * @property {string[]} [secondaryDomains] - Additional relevant domains
   * 
   * @property {string[]} prerequisites - Array of concept IDs that must be understood first
   * @property {string[]} enables - Array of concept IDs that this concept unlocks
   * @property {string[]} [relatedConcepts] - Array of concept IDs for related topics
   * 
   * @property {React.Component} visualization - The interactive component to render
   * @property {string} definition - Clear, concise definition of the concept
   * @property {string} [intuition] - Plain-language explanation for beginners
   * 
   * @property {string[]} [properties] - Key properties or characteristics
   * @property {string[]} [axioms] - Formal axioms (for structures/rules)
   * @property {ConceptExample[]} [examples] - Concrete examples
   * 
   * @property {string} [mlRelevance] - Why this matters for ML/AI
   * @property {string[]} [applications] - Array of application concept IDs
   * 
   * @property {Object} [metadata] - Additional metadata
   * @property {boolean} [metadata.isAdvanced] - Flag for advanced concepts
   * @property {string[]} [metadata.tags] - Search tags
   * @property {number} [metadata.difficulty] - Difficulty level (1-5)
   * @property {string} [metadata.estimatedTime] - Estimated learning time
   */
  
  /**
   * Example structure for concept examples
   * 
   * @typedef {Object} ConceptExample
   * @property {string} name - Name of the example
   * @property {string} description - What this example demonstrates
   * @property {*} [data] - Any data needed for the example
   * @property {Object} [config] - Configuration for the visualization
   */
  
  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================
  
  /**
   * Validates if a value is a valid layer
   * @param {string} layer - Layer to validate
   * @returns {boolean}
   */
  export const isValidLayer = (layer) => {
    return Object.values(LAYERS).includes(layer);
  };
  
  /**
   * Validates if a value is a valid domain
   * @param {string} domain - Domain to validate
   * @returns {boolean}
   */
  export const isValidDomain = (domain) => {
    return Object.values(DOMAINS).includes(domain);
  };
  
  /**
   * Validates the basic structure of a concept object
   * @param {Object} concept - Concept to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  export const validateConcept = (concept) => {
    const errors = [];
  
    // Required fields
    if (!concept.id) errors.push('Missing required field: id');
    if (!concept.name) errors.push('Missing required field: name');
    if (!concept.layer) errors.push('Missing required field: layer');
    if (!concept.domain) errors.push('Missing required field: domain');
    if (!concept.visualization) errors.push('Missing required field: visualization');
    if (!concept.definition) errors.push('Missing required field: definition');
  
    // Validate layer
    if (concept.layer && !isValidLayer(concept.layer)) {
      errors.push(`Invalid layer: ${concept.layer}`);
    }
  
    // Validate domain
    if (concept.domain && !isValidDomain(concept.domain)) {
      errors.push(`Invalid domain: ${concept.domain}`);
    }
  
    // Validate arrays
    if (concept.prerequisites && !Array.isArray(concept.prerequisites)) {
      errors.push('prerequisites must be an array');
    }
    if (concept.enables && !Array.isArray(concept.enables)) {
      errors.push('enables must be an array');
    }
  
    // Validate ID format (kebab-case)
    if (concept.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(concept.id)) {
      errors.push('id must be in kebab-case format (e.g., gradient-descent)');
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Creates a minimal valid concept object with defaults
   * @param {Object} partial - Partial concept data
   * @returns {Concept}
   */
  export const createConcept = (partial) => {
    return {
      id: partial.id || '',
      name: partial.name || '',
      layer: partial.layer || LAYERS.OBJECTS,
      domain: partial.domain || DOMAINS.LINEAR_ALGEBRA,
      
      prerequisites: partial.prerequisites || [],
      enables: partial.enables || [],
      relatedConcepts: partial.relatedConcepts || [],
      
      visualization: partial.visualization || null,
      definition: partial.definition || '',
      intuition: partial.intuition || '',
      
      properties: partial.properties || [],
      axioms: partial.axioms || [],
      examples: partial.examples || [],
      
      mlRelevance: partial.mlRelevance || '',
      applications: partial.applications || [],
      
      metadata: {
        isAdvanced: false,
        tags: [],
        difficulty: 1,
        estimatedTime: '10 mins',
        ...partial.metadata
      }
    };
  };
  
  // ============================================================================
  // UTILITY TYPES
  // ============================================================================
  
  /**
   * Concept with computed properties (added by registry)
   * 
   * @typedef {Concept} EnrichedConcept
   * @property {number} depth - Depth in dependency tree (0 = no prerequisites)
   * @property {boolean} isLeaf - True if no other concepts depend on this
   * @property {string[]} dependents - Concepts that depend on this one
   */
  
  /**
   * Learning path node
   * 
   * @typedef {Object} PathNode
   * @property {string} conceptId
   * @property {number} order - Position in learning sequence
   * @property {string} reason - Why this is needed at this point
   */
  
  // ============================================================================
  // COLOR SCHEMES
  // ============================================================================
  
  /**
   * Colors for each layer (for UI consistency)
   */
  export const LAYER_COLORS = {
    [LAYERS.OBJECTS]: {
      primary: 'from-slate-500 to-gray-600',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      text: 'text-slate-400'
    },
    [LAYERS.STRUCTURES]: {
      primary: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400'
    },
    [LAYERS.RULES]: {
      primary: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400'
    },
    [LAYERS.COMPUTATION]: {
      primary: 'from-cyan-500 to-teal-600',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400'
    },
    [LAYERS.APPLICATIONS]: {
      primary: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400'
    }
  };
  
  /**
   * Domain colors
   */
  export const DOMAIN_COLORS = {
    [DOMAINS.LINEAR_ALGEBRA]: 'text-blue-400',
    [DOMAINS.CALCULUS]: 'text-purple-400',
    [DOMAINS.PROBABILITY]: 'text-yellow-400',
    [DOMAINS.STATISTICS]: 'text-orange-400',
    [DOMAINS.OPTIMIZATION]: 'text-cyan-400',
    [DOMAINS.TOPOLOGY]: 'text-pink-400',
    [DOMAINS.GEOMETRY]: 'text-indigo-400',
    [DOMAINS.INFORMATION_THEORY]: 'text-amber-400',
    [DOMAINS.MACHINE_LEARNING]: 'text-emerald-400',
    [DOMAINS.DEEP_LEARNING]: 'text-teal-400'
  };
  
  // ============================================================================
  // EXPORTS
  // ============================================================================
  
  export default {
    LAYERS,
    LAYER_NAMES,
    LAYER_DESCRIPTIONS,
    DOMAINS,
    DOMAIN_NAMES,
    LAYER_COLORS,
    DOMAIN_COLORS,
    isValidLayer,
    isValidDomain,
    validateConcept,
    createConcept
  };