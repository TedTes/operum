/**
 * CONCEPT UTILITY FUNCTIONS
 * 
 * Helper functions for working with concepts, relationships, and learning paths.
 * These are pure functions that operate on concept data.
 */

import registry from '../core/ConceptRegistry.js';
import { LAYERS, LAYER_NAMES } from '../types/concept.js';

// ==========================================================================
// DEPENDENCY HELPERS
// ==========================================================================

/**
 * Get all dependencies for a concept (direct prerequisites)
 * @param {string} conceptId
 * @returns {Object[]} Array of prerequisite concept objects
 */
export const getDependencies = (conceptId) => {
  const prereqIds = registry.getPrerequisites(conceptId);
  return prereqIds.map(id => registry.get(id)).filter(c => c !== null);
};

/**
 * Get all concepts that this concept enables
 * @param {string} conceptId
 * @returns {Object[]} Array of enabled concept objects
 */
export const getEnabledConcepts = (conceptId) => {
  return registry.getEnabledBy(conceptId);
};

/**
 * Get the full dependency tree for a concept (all ancestors)
 * @param {string} conceptId
 * @returns {Object} Tree structure with nested prerequisites
 */
export const getDependencyTree = (conceptId) => {
  const concept = registry.get(conceptId);
  if (!concept) return null;

  const buildTree = (id) => {
    const c = registry.get(id);
    if (!c) return null;

    const prereqs = registry.getPrerequisites(id);
    
    return {
      id: c.id,
      name: c.name,
      layer: c.layer,
      prerequisites: prereqs.map(prereqId => buildTree(prereqId)).filter(t => t !== null)
    };
  };

  return buildTree(conceptId);
};

/**
 * Calculate the depth of a concept (longest path from root)
 * @param {string} conceptId
 * @returns {number} Depth level (0 = no prerequisites)
 */
export const getConceptDepth = (conceptId) => {
  const calculateDepth = (id, visited = new Set()) => {
    if (visited.has(id)) return 0; // Prevent infinite loops
    visited.add(id);

    const prereqs = registry.getPrerequisites(id);
    if (prereqs.length === 0) return 0;

    const depths = prereqs.map(prereqId => calculateDepth(prereqId, new Set(visited)));
    return Math.max(...depths) + 1;
  };

  return calculateDepth(conceptId);
};

/**
 * Check if concept A depends on concept B (directly or indirectly)
 * @param {string} conceptIdA
 * @param {string} conceptIdB
 * @returns {boolean}
 */
export const dependsOn = (conceptIdA, conceptIdB) => {
  const chain = registry.getPrerequisiteChain(conceptIdA);
  return chain.includes(conceptIdB);
};

/**
 * Find common prerequisites between two concepts
 * @param {string} conceptIdA
 * @param {string} conceptIdB
 * @returns {string[]} Array of common prerequisite IDs
 */
export const findCommonPrerequisites = (conceptIdA, conceptIdB) => {
  const chainA = new Set(registry.getPrerequisiteChain(conceptIdA));
  const chainB = new Set(registry.getPrerequisiteChain(conceptIdB));
  
  return Array.from(chainA).filter(id => chainB.has(id));
};

// ==========================================================================
// LEARNING PATH HELPERS
// ==========================================================================

/**
 * Build a learning path between two concepts
 * @param {string} fromConceptId - Starting concept (already know)
 * @param {string} toConceptId - Target concept (want to learn)
 * @returns {string[]} Ordered array of concept IDs to study
 */
export const buildPathBetween = (fromConceptId, toConceptId) => {
  const completed = new Set([fromConceptId]);
  
  // Get prerequisites of target that aren't in the completed set
  const targetChain = registry.getPrerequisiteChain(toConceptId);
  const fromChain = new Set(registry.getPrerequisiteChain(fromConceptId));
  
  // Filter out concepts already covered by fromConcept
  const pathConcepts = targetChain.filter(id => !fromChain.has(id) && id !== fromConceptId);
  
  // Add the target concept at the end
  pathConcepts.push(toConceptId);
  
  return pathConcepts;
};

/**
 * Get the shortest learning path to a concept
 * @param {string} conceptId
 * @param {Set<string>} completedConcepts
 * @returns {Object[]} Array of concept objects in order
 */
export const getShortestPath = (conceptId, completedConcepts = new Set()) => {
  const path = registry.generateLearningPath(conceptId, completedConcepts);
  return path.map(id => registry.get(id)).filter(c => c !== null);
};

/**
 * Estimate total learning time for a concept (including prerequisites)
 * @param {string} conceptId
 * @param {Set<string>} completedConcepts
 * @returns {string} Estimated time (e.g., "2 hours 30 mins")
 */
export const estimateLearningTime = (conceptId, completedConcepts = new Set()) => {
  const path = registry.generateLearningPath(conceptId, completedConcepts);
  
  let totalMinutes = 0;
  path.forEach(id => {
    const concept = registry.get(id);
    if (concept?.metadata?.estimatedTime) {
      // Parse time string (e.g., "10 mins", "1 hour", "30 mins")
      const timeStr = concept.metadata.estimatedTime;
      const hourMatch = timeStr.match(/(\d+)\s*hour/i);
      const minMatch = timeStr.match(/(\d+)\s*min/i);
      
      if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
      if (minMatch) totalMinutes += parseInt(minMatch[1]);
    }
  });

  if (totalMinutes === 0) return 'Unknown';
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} mins`;
};

/**
 * Get next logical concepts to study based on layer progression
 * @param {string} currentConceptId
 * @returns {Object[]} Array of recommended next concepts
 */
export const getNextConcepts = (currentConceptId) => {
  const current = registry.get(currentConceptId);
  if (!current) return [];

  // Get concepts that this enables
  const enabled = registry.getEnabledBy(currentConceptId);
  
  // Get concepts in the same layer
  const sameLayers = registry.getByLayer(current.layer)
    .filter(c => c.id !== currentConceptId);
  
  // Get concepts in the next layer
  const layers = Object.values(LAYERS);
  const currentLayerIndex = layers.indexOf(current.layer);
  const nextLayer = layers[currentLayerIndex + 1];
  const nextLayerConcepts = nextLayer ? registry.getByLayer(nextLayer) : [];

  // Combine and deduplicate
  const allNext = [...enabled, ...sameLayers, ...nextLayerConcepts];
  const uniqueIds = new Set();
  const unique = allNext.filter(c => {
    if (uniqueIds.has(c.id)) return false;
    uniqueIds.add(c.id);
    return true;
  });

  return unique;
};

// ==========================================================================
// PROGRESS HELPERS
// ==========================================================================

/**
 * Calculate progress percentage for a learning goal
 * @param {string} targetConceptId
 * @param {Set<string>} completedConcepts
 * @returns {number} Percentage (0-100)
 */
export const calculateProgress = (targetConceptId, completedConcepts = new Set()) => {
  const requiredPath = registry.generateLearningPath(targetConceptId, new Set());
  if (requiredPath.length === 0) return 100;

  const completed = requiredPath.filter(id => completedConcepts.has(id));
  return Math.round((completed.length / requiredPath.length) * 100);
};

/**
 * Get unlockable concepts (prerequisites met)
 * @param {Set<string>} completedConcepts
 * @returns {Object[]} Array of unlockable concept objects
 */
export const getUnlockableConcepts = (completedConcepts = new Set()) => {
  const unlockable = [];
  
  registry.getAll().forEach(concept => {
    if (completedConcepts.has(concept.id)) return;
    
    if (registry.arePrerequisitesMet(concept.id, completedConcepts)) {
      unlockable.push(concept);
    }
  });

  return unlockable;
};

/**
 * Check if a concept is locked (prerequisites not met)
 * @param {string} conceptId
 * @param {Set<string>} completedConcepts
 * @returns {boolean}
 */
export const isLocked = (conceptId, completedConcepts = new Set()) => {
  return !registry.arePrerequisitesMet(conceptId, completedConcepts);
};

/**
 * Get missing prerequisites for a locked concept
 * @param {string} conceptId
 * @param {Set<string>} completedConcepts
 * @returns {Object[]} Array of missing prerequisite concept objects
 */
export const getMissingPrerequisites = (conceptId, completedConcepts = new Set()) => {
  const prereqs = registry.getPrerequisites(conceptId);
  const missing = prereqs.filter(id => !completedConcepts.has(id));
  return missing.map(id => registry.get(id)).filter(c => c !== null);
};

// ==========================================================================
// FILTERING & SORTING HELPERS
// ==========================================================================

/**
 * Sort concepts by layer order
 * @param {Object[]} concepts
 * @returns {Object[]} Sorted array
 */
export const sortByLayer = (concepts) => {
  const layerOrder = Object.values(LAYERS);
  return [...concepts].sort((a, b) => {
    return layerOrder.indexOf(a.layer) - layerOrder.indexOf(b.layer);
  });
};

/**
 * Sort concepts by difficulty
 * @param {Object[]} concepts
 * @returns {Object[]} Sorted array
 */
export const sortByDifficulty = (concepts) => {
  return [...concepts].sort((a, b) => {
    const diffA = a.metadata?.difficulty || 1;
    const diffB = b.metadata?.difficulty || 1;
    return diffA - diffB;
  });
};

/**
 * Sort concepts by depth (number of prerequisites)
 * @param {Object[]} concepts
 * @returns {Object[]} Sorted array
 */
export const sortByDepth = (concepts) => {
  return [...concepts].sort((a, b) => {
    const depthA = getConceptDepth(a.id);
    const depthB = getConceptDepth(b.id);
    return depthA - depthB;
  });
};

/**
 * Filter concepts by difficulty level
 * @param {Object[]} concepts
 * @param {number} maxDifficulty - Max difficulty (1-5)
 * @returns {Object[]}
 */
export const filterByDifficulty = (concepts, maxDifficulty) => {
  return concepts.filter(c => {
    const diff = c.metadata?.difficulty || 1;
    return diff <= maxDifficulty;
  });
};

/**
 * Filter concepts by whether they're advanced
 * @param {Object[]} concepts
 * @param {boolean} includeAdvanced
 * @returns {Object[]}
 */
export const filterAdvanced = (concepts, includeAdvanced = true) => {
  return concepts.filter(c => {
    const isAdvanced = c.metadata?.isAdvanced || false;
    return includeAdvanced || !isAdvanced;
  });
};

// ==========================================================================
// FORMATTING HELPERS
// ==========================================================================

/**
 * Get human-readable layer name
 * @param {string} layer
 * @returns {string}
 */
export const getLayerName = (layer) => {
  return LAYER_NAMES[layer] || layer;
};

/**
 * Format a list of concepts as a readable string
 * @param {Object[]} concepts
 * @returns {string}
 */
export const formatConceptList = (concepts) => {
  if (concepts.length === 0) return 'None';
  if (concepts.length === 1) return concepts[0].name;
  if (concepts.length === 2) return `${concepts[0].name} and ${concepts[1].name}`;
  
  const names = concepts.map(c => c.name);
  const last = names.pop();
  return `${names.join(', ')}, and ${last}`;
};

/**
 * Create a breadcrumb path for prerequisites
 * @param {string} conceptId
 * @returns {Object[]} Array of {id, name, layer} for breadcrumbs
 */
export const createBreadcrumbs = (conceptId) => {
  const chain = registry.getPrerequisiteChain(conceptId);
  const breadcrumbs = chain.map(id => {
    const concept = registry.get(id);
    return concept ? { id: concept.id, name: concept.name, layer: concept.layer } : null;
  }).filter(b => b !== null);

  // Add current concept
  const current = registry.get(conceptId);
  if (current) {
    breadcrumbs.push({ id: current.id, name: current.name, layer: current.layer });
  }

  return breadcrumbs;
};

// ==========================================================================
// GRAPH HELPERS
// ==========================================================================

/**
 * Get graph data for visualization libraries
 * @param {string[]} conceptIds - Optional filter for specific concepts
 * @returns {Object} {nodes: [], edges: []}
 */
export const getGraphData = (conceptIds = null) => {
  const concepts = conceptIds 
    ? conceptIds.map(id => registry.get(id)).filter(c => c !== null)
    : registry.getAll();

  const nodes = concepts.map(concept => ({
    id: concept.id,
    label: concept.name,
    layer: concept.layer,
    domain: concept.domain,
    group: concept.layer
  }));

  const edges = [];
  concepts.forEach(concept => {
    const prereqs = concept.prerequisites || [];
    prereqs.forEach(prereqId => {
      // Only add edge if both nodes are in the filtered set
      if (!conceptIds || conceptIds.includes(prereqId)) {
        edges.push({
          from: prereqId,
          to: concept.id,
          arrows: 'to'
        });
      }
    });
  });

  return { nodes, edges };
};

/**
 * Get subgraph centered on a concept (include prerequisites and dependents)
 * @param {string} conceptId
 * @param {number} depth - How many levels to include
 * @returns {Object} {nodes: [], edges: []}
 */
export const getSubgraph = (conceptId, depth = 2) => {
  const included = new Set([conceptId]);

  // Add prerequisites up to depth
  const addPrerequisites = (id, currentDepth) => {
    if (currentDepth >= depth) return;
    const prereqs = registry.getPrerequisites(id);
    prereqs.forEach(prereqId => {
      included.add(prereqId);
      addPrerequisites(prereqId, currentDepth + 1);
    });
  };

  // Add dependents up to depth
  const addDependents = (id, currentDepth) => {
    if (currentDepth >= depth) return;
    const dependents = registry.getDependents(id);
    dependents.forEach(depId => {
      included.add(depId);
      addDependents(depId, currentDepth + 1);
    });
  };

  addPrerequisites(conceptId, 0);
  addDependents(conceptId, 0);

  return getGraphData(Array.from(included));
};

// ==========================================================================
// EXPORTS
// ==========================================================================

export default {
  // Dependencies
  getDependencies,
  getEnabledConcepts,
  getDependencyTree,
  getConceptDepth,
  dependsOn,
  findCommonPrerequisites,

  // Learning paths
  buildPathBetween,
  getShortestPath,
  estimateLearningTime,
  getNextConcepts,

  // Progress
  calculateProgress,
  getUnlockableConcepts,
  isLocked,
  getMissingPrerequisites,

  // Filtering & sorting
  sortByLayer,
  sortByDifficulty,
  sortByDepth,
  filterByDifficulty,
  filterAdvanced,

  // Formatting
  getLayerName,
  formatConceptList,
  createBreadcrumbs,

  // Graph
  getGraphData,
  getSubgraph
};