/**
 * CONCEPT CARD COMPONENT
 * 
 * Displays a single concept as a card in lists, grids, or galleries.
 * Shows key metadata: layer, domain, prerequisites, lock state, etc.
 */

import React from 'react';
import { LAYER_COLORS, DOMAIN_COLORS, LAYER_NAMES, DOMAIN_NAMES } from '../../types/concept.js';

/**
 * ConceptCard Component
 * 
 * @param {Object} props
 * @param {Object} props.concept - Concept object
 * @param {boolean} props.isLocked - Whether prerequisites are met
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isCompleted - Whether user completed this
 * @param {string} props.size - 'small', 'medium', 'large'
 */
export const ConceptCard = ({ 
  concept, 
  isLocked = false, 
  onClick, 
  isCompleted = false,
  size = 'medium' 
}) => {
  
  if (!concept) return null;

  const layerColor = LAYER_COLORS[concept.layer] || LAYER_COLORS['objects'];
  const domainColor = DOMAIN_COLORS[concept.domain] || 'text-gray-400';
  
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const difficulty = concept.metadata?.difficulty || 1;
  const difficultyStars = '⭐'.repeat(difficulty);

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        bg-slate-900 rounded-xl border border-white/10
        hover:border-white/30 hover:bg-slate-800/50
        transition-all duration-200 cursor-pointer
        ${isLocked ? 'opacity-60' : ''}
        ${isCompleted ? 'ring-2 ring-emerald-500/50' : ''}
        relative overflow-hidden group
      `}
    >
      {/* Background gradient effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10 
        transition-opacity duration-300
        bg-gradient-to-br ${layerColor.primary}
      `} />

      {/* Lock indicator */}
      {isLocked && (
        <div className="absolute top-2 right-2 text-2xl">
          🔒
        </div>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <div className="absolute top-2 right-2 text-2xl">
          ✅
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Layer and Domain badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`
            text-xs font-bold px-2 py-1 rounded
            ${layerColor.bg} ${layerColor.text} border ${layerColor.border}
          `}>
            {LAYER_NAMES[concept.layer]}
          </span>
          
          <span className={`text-xs ${domainColor}`}>
            {DOMAIN_NAMES[concept.domain]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {concept.name}
        </h3>

        {/* Definition snippet */}
        {concept.intuition && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {concept.intuition.split('.')[0]}.
          </p>
        )}

        {/* Metadata footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            {/* Difficulty */}
            <span title={`Difficulty: ${difficulty}/5`}>
              {difficultyStars}
            </span>

            {/* Time estimate */}
            {concept.metadata?.estimatedTime && (
              <span className="flex items-center gap-1">
                ⏱️ {concept.metadata.estimatedTime}
              </span>
            )}
          </div>

          {/* Prerequisites count */}
          {concept.prerequisites && concept.prerequisites.length > 0 && (
            <span className="flex items-center gap-1" title="Prerequisites">
              🔗 {concept.prerequisites.length}
            </span>
          )}
        </div>

        {/* Tags (if present) */}
        {concept.metadata?.tags && concept.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {concept.metadata.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500"
              >
                {tag}
              </span>
            ))}
            {concept.metadata.tags.length > 3 && (
              <span className="text-xs text-gray-600">
                +{concept.metadata.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ConceptCardSkeleton - Loading state
 */
export const ConceptCardSkeleton = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'p-3 h-32',
    medium: 'p-4 h-40',
    large: 'p-6 h-48'
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      bg-slate-900 rounded-xl border border-white/10
      animate-pulse
    `}>
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-20 bg-white/10 rounded"></div>
        <div className="h-6 w-24 bg-white/10 rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-white/10 rounded mb-2"></div>
      <div className="h-4 w-full bg-white/10 rounded mb-1"></div>
      <div className="h-4 w-5/6 bg-white/10 rounded"></div>
    </div>
  );
};

/**
 * ConceptCardGrid - Container for multiple cards
 */
export const ConceptCardGrid = ({ 
  concepts, 
  lockedConcepts = new Set(), 
  completedConcepts = new Set(),
  onConceptClick,
  columns = 3,
  size = 'medium'
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {concepts.map(concept => (
        <ConceptCard
          key={concept.id}
          concept={concept}
          isLocked={lockedConcepts.has(concept.id)}
          isCompleted={completedConcepts.has(concept.id)}
          onClick={() => onConceptClick && onConceptClick(concept)}
          size={size}
        />
      ))}
    </div>
  );
};

/**
 * ConceptCardList - List view (alternative to grid)
 */
export const ConceptCardList = ({ 
  concepts, 
  lockedConcepts = new Set(), 
  completedConcepts = new Set(),
  onConceptClick
}) => {
  return (
    <div className="space-y-3">
      {concepts.map(concept => (
        <ConceptCard
          key={concept.id}
          concept={concept}
          isLocked={lockedConcepts.has(concept.id)}
          isCompleted={completedConcepts.has(concept.id)}
          onClick={() => onConceptClick && onConceptClick(concept)}
          size="small"
        />
      ))}
    </div>
  );
};

export default ConceptCard;