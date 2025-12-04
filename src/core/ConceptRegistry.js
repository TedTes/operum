/**
 * CONCEPT REGISTRY SYSTEM
 * 
 * Central registry that manages all mathematical concepts, their relationships,
 * and provides query methods for the UI to consume.
 * 
 * This is the "brain" of the dynamic concept architecture.
 */

import { LAYERS, validateConcept } from '../types/concept.js';

/**
 * ConceptRegistry class - Singleton pattern
 * Manages all concepts and their dependency relationships
 */
class ConceptRegistry {
  constructor() {
    if (ConceptRegistry.instance) {
      return ConceptRegistry.instance;
    }

    this.concepts = new Map(); // conceptId -> concept
    this.dependencyGraph = new Map(); // conceptId -> { prerequisites: Set, dependents: Set }
    this.layerIndex = new Map(); // layer -> Set of conceptIds
    this.domainIndex = new Map(); // domain -> Set of conceptIds
    this.initialized = false;

    ConceptRegistry.instance = this;
  }

  // ==========================================================================
  // REGISTRATION METHODS
  // ==========================================================================

  /**
   * Register a single concept
   * @param {Object} concept - Concept object following the schema
   * @returns {{success: boolean, errors: string[]}}
   */
  register(concept) {
    // Validate concept structure
    const validation = validateConcept(concept);
    if (!validation.valid) {
      console.error(`Failed to register concept "${concept.id}":`, validation.errors);
      return { success: false, errors: validation.errors };
    }

    // Check for duplicate ID
    if (this.concepts.has(concept.id)) {
      const error = `Concept with id "${concept.id}" already exists`;
      console.warn(error);
      return { success: false, errors: [error] };
    }

    // Store concept
    this.concepts.set(concept.id, concept);

    // Index by layer
    if (!this.layerIndex.has(concept.layer)) {
      this.layerIndex.set(concept.layer, new Set());
    }
    this.layerIndex.get(concept.layer).add(concept.id);

    // Index by domain
    if (!this.domainIndex.has(concept.domain)) {
      this.domainIndex.set(concept.domain, new Set());
    }
    this.domainIndex.get(concept.domain).add(concept.id);

    // Index secondary domains
    if (concept.secondaryDomains) {
      concept.secondaryDomains.forEach(domain => {
        if (!this.domainIndex.has(domain)) {
          this.domainIndex.set(domain, new Set());
        }
        this.domainIndex.get(domain).add(concept.id);
      });
    }

    // Initialize dependency graph entry
    if (!this.dependencyGraph.has(concept.id)) {
      this.dependencyGraph.set(concept.id, {
        prerequisites: new Set(concept.prerequisites || []),
        dependents: new Set()
      });
    }

    return { success: true, errors: [] };
  }

  /**
   * Register multiple concepts at once
   * @param {Object[]} concepts - Array of concept objects
   * @returns {{successful: number, failed: number, errors: Object[]}}
   */
  registerBatch(concepts) {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    concepts.forEach(concept => {
      const result = this.register(concept);
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          conceptId: concept.id,
          errors: result.errors
        });
      }
    });

    // Build dependency graph after all concepts are registered
    if (results.successful > 0) {
      this.buildDependencyGraph();
    }

    return results;
  }

  /**
   * Mark registry as initialized (prevents duplicate initialization)
   */
  markInitialized() {
    this.initialized = true;
  }

  // ==========================================================================
  // DEPENDENCY GRAPH METHODS
  // ==========================================================================

  /**
   * Build the complete dependency graph
   * Maps prerequisites to dependents (reverse lookup)
   */
  buildDependencyGraph() {
    // Reset dependents
    this.dependencyGraph.forEach(node => {
      node.dependents.clear();
    });

    // Build reverse dependencies
    this.concepts.forEach((concept, conceptId) => {
      const prerequisites = concept.prerequisites || [];
      
      prerequisites.forEach(prereqId => {
        // Ensure prerequisite exists in graph
        if (!this.dependencyGraph.has(prereqId)) {
          this.dependencyGraph.set(prereqId, {
            prerequisites: new Set(),
            dependents: new Set()
          });
        }
        
        // Add this concept as a dependent of the prerequisite
        this.dependencyGraph.get(prereqId).dependents.add(conceptId);
      });
    });
  }

  /**
   * Get all concepts that depend on a given concept
   * @param {string} conceptId
   * @returns {string[]} Array of dependent concept IDs
   */
  getDependents(conceptId) {
    const node = this.dependencyGraph.get(conceptId);
    return node ? Array.from(node.dependents) : [];
  }

  /**
   * Get all prerequisites for a concept (direct only)
   * @param {string} conceptId
   * @returns {string[]} Array of prerequisite concept IDs
   */
  getPrerequisites(conceptId) {
    const concept = this.concepts.get(conceptId);
    return concept ? concept.prerequisites || [] : [];
  }

  /**
   * Get full prerequisite chain (recursive, all ancestors)
   * @param {string} conceptId
   * @returns {string[]} Array of all prerequisite IDs in dependency order
   */
  getPrerequisiteChain(conceptId) {
    const visited = new Set();
    const chain = [];

    const traverse = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const prereqs = this.getPrerequisites(id);
      prereqs.forEach(prereqId => {
        traverse(prereqId);
      });

      if (id !== conceptId) {
        chain.push(id);
      }
    };

    traverse(conceptId);
    return chain;
  }

  /**
   * Check if all prerequisites are met
   * @param {string} conceptId
   * @param {Set<string>} completedConcepts - Set of completed concept IDs
   * @returns {boolean}
   */
  arePrerequisitesMet(conceptId, completedConcepts = new Set()) {
    const prereqs = this.getPrerequisites(conceptId);
    return prereqs.every(prereqId => completedConcepts.has(prereqId));
  }

  /**
   * Get concepts that are unlocked by completing a concept
   * (concepts whose prerequisites are now satisfied)
   * @param {string} completedConceptId
   * @param {Set<string>} completedConcepts - Set of all completed concepts
   * @returns {string[]} Array of newly unlocked concept IDs
   */
  getUnlockedConcepts(completedConceptId, completedConcepts) {
    const unlocked = [];
    const dependents = this.getDependents(completedConceptId);

    dependents.forEach(dependentId => {
      if (!completedConcepts.has(dependentId)) {
        if (this.arePrerequisitesMet(dependentId, completedConcepts)) {
          unlocked.push(dependentId);
        }
      }
    });

    return unlocked;
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get a concept by ID
   * @param {string} conceptId
   * @returns {Object|null}
   */
  get(conceptId) {
    return this.concepts.get(conceptId) || null;
  }

  /**
   * Get all concepts
   * @returns {Object[]}
   */
  getAll() {
    return Array.from(this.concepts.values());
  }

  /**
   * Get all concepts in a specific layer
   * @param {string} layer - Layer name from LAYERS enum
   * @returns {Object[]}
   */
  getByLayer(layer) {
    const conceptIds = this.layerIndex.get(layer) || new Set();
    return Array.from(conceptIds).map(id => this.concepts.get(id));
  }

  /**
   * Get all concepts in a specific domain
   * @param {string} domain - Domain name from DOMAINS enum
   * @returns {Object[]}
   */
  getByDomain(domain) {
    const conceptIds = this.domainIndex.get(domain) || new Set();
    return Array.from(conceptIds).map(id => this.concepts.get(id));
  }

  /**
   * Get concepts by layer and domain
   * @param {string} layer
   * @param {string} domain
   * @returns {Object[]}
   */
  getByLayerAndDomain(layer, domain) {
    const layerConcepts = this.layerIndex.get(layer) || new Set();
    const domainConcepts = this.domainIndex.get(domain) || new Set();
    
    // Intersection
    const intersection = new Set(
      [...layerConcepts].filter(id => domainConcepts.has(id))
    );
    
    return Array.from(intersection).map(id => this.concepts.get(id));
  }

  /**
   * Get concepts that enable/unlock a specific concept
   * @param {string} conceptId
   * @returns {Object[]}
   */
  getEnabledBy(conceptId) {
    const concept = this.concepts.get(conceptId);
    if (!concept || !concept.enables) return [];
    
    return concept.enables
      .map(id => this.concepts.get(id))
      .filter(c => c !== undefined);
  }

  /**
   * Get related concepts
   * @param {string} conceptId
   * @returns {Object[]}
   */
  getRelated(conceptId) {
    const concept = this.concepts.get(conceptId);
    if (!concept || !concept.relatedConcepts) return [];
    
    return concept.relatedConcepts
      .map(id => this.concepts.get(id))
      .filter(c => c !== undefined);
  }

  /**
   * Search concepts by name or tags
   * @param {string} query - Search query
   * @returns {Object[]}
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    
    return this.getAll().filter(concept => {
      // Search in name
      if (concept.name.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in tags
      if (concept.metadata?.tags) {
        if (concept.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
          return true;
        }
      }
      
      // Search in definition
      if (concept.definition?.toLowerCase().includes(lowerQuery)) return true;
      
      return false;
    });
  }

  // ==========================================================================
  // LEARNING PATH METHODS
  // ==========================================================================

  /**
   * Generate a learning path to reach a target concept
   * @param {string} targetConceptId
   * @param {Set<string>} completedConcepts - Set of already completed concept IDs
   * @returns {string[]} Ordered array of concept IDs to study
   */
  generateLearningPath(targetConceptId, completedConcepts = new Set()) {
    const path = [];
    const visited = new Set([...completedConcepts]);

    const addToPath = (conceptId) => {
      if (visited.has(conceptId)) return;
      
      const prereqs = this.getPrerequisites(conceptId);
      
      // Add prerequisites first
      prereqs.forEach(prereqId => {
        addToPath(prereqId);
      });
      
      // Then add this concept
      if (!visited.has(conceptId)) {
        path.push(conceptId);
        visited.add(conceptId);
      }
    };

    addToPath(targetConceptId);
    return path;
  }

  /**
   * Get next recommended concepts based on completed ones
   * @param {Set<string>} completedConcepts
   * @param {number} limit - Max number of recommendations
   * @returns {Object[]} Array of recommended concepts
   */
  getRecommendations(completedConcepts = new Set(), limit = 5) {
    const recommendations = [];

    this.concepts.forEach(concept => {
      // Skip if already completed
      if (completedConcepts.has(concept.id)) return;

      // Check if prerequisites are met
      if (this.arePrerequisitesMet(concept.id, completedConcepts)) {
        recommendations.push(concept);
      }
    });

    // Sort by layer order and difficulty
    const layerOrder = Object.values(LAYERS);
    recommendations.sort((a, b) => {
      const layerDiff = layerOrder.indexOf(a.layer) - layerOrder.indexOf(b.layer);
      if (layerDiff !== 0) return layerDiff;
      
      const diffA = a.metadata?.difficulty || 1;
      const diffB = b.metadata?.difficulty || 1;
      return diffA - diffB;
    });

    return recommendations.slice(0, limit);
  }

  // ==========================================================================
  // STATISTICS & METADATA
  // ==========================================================================

  /**
   * Get registry statistics
   * @returns {Object}
   */
  getStats() {
    const stats = {
      totalConcepts: this.concepts.size,
      byLayer: {},
      byDomain: {},
      averagePrerequisites: 0,
      rootConcepts: 0, // Concepts with no prerequisites
      leafConcepts: 0  // Concepts that nothing depends on
    };

    // Count by layer
    Object.values(LAYERS).forEach(layer => {
      const concepts = this.layerIndex.get(layer) || new Set();
      stats.byLayer[layer] = concepts.size;
    });

    // Count by domain
    this.domainIndex.forEach((conceptIds, domain) => {
      stats.byDomain[domain] = conceptIds.size;
    });

    // Calculate averages and roots/leaves
    let totalPrereqs = 0;
    this.concepts.forEach((concept, conceptId) => {
      const prereqs = concept.prerequisites || [];
      totalPrereqs += prereqs.length;
      
      if (prereqs.length === 0) stats.rootConcepts++;
      
      const dependents = this.getDependents(conceptId);
      if (dependents.length === 0) stats.leafConcepts++;
    });

    stats.averagePrerequisites = this.concepts.size > 0 
      ? (totalPrereqs / this.concepts.size).toFixed(2) 
      : 0;

    return stats;
  }

  /**
   * Check registry health (find issues)
   * @returns {{healthy: boolean, issues: string[]}}
   */
  checkHealth() {
    const issues = [];

    // Check for missing prerequisites
    this.concepts.forEach((concept, conceptId) => {
      const prereqs = concept.prerequisites || [];
      prereqs.forEach(prereqId => {
        if (!this.concepts.has(prereqId)) {
          issues.push(`Concept "${conceptId}" references missing prerequisite "${prereqId}"`);
        }
      });
    });

    // Check for circular dependencies
    const detectCycles = (conceptId, visited = new Set(), path = []) => {
      if (path.includes(conceptId)) {
        issues.push(`Circular dependency detected: ${[...path, conceptId].join(' -> ')}`);
        return;
      }

      if (visited.has(conceptId)) return;
      visited.add(conceptId);

      const prereqs = this.getPrerequisites(conceptId);
      prereqs.forEach(prereqId => {
        detectCycles(prereqId, visited, [...path, conceptId]);
      });
    };

    this.concepts.forEach((concept, conceptId) => {
      detectCycles(conceptId);
    });

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Clear all concepts (useful for testing)
   */
  clear() {
    this.concepts.clear();
    this.dependencyGraph.clear();
    this.layerIndex.clear();
    this.domainIndex.clear();
    this.initialized = false;
  }

  /**
   * Export registry data as JSON
   * @returns {Object}
   */
  export() {
    return {
      concepts: Array.from(this.concepts.values()).map(concept => ({
        ...concept,
        visualization: undefined // Can't serialize React components
      })),
      stats: this.getStats(),
      health: this.checkHealth()
    };
  }
}

// ==========================================================================
// SINGLETON EXPORT
// ==========================================================================

/**
 * Singleton instance of the concept registry
 * Use this throughout the application
 */
const registry = new ConceptRegistry();

export default registry;
export { ConceptRegistry };