/**
 * CONCEPT PAGE TEMPLATE
 * 
 * Universal template for rendering any concept. Dynamically displays
 * all relevant sections based on concept data.
 */

import React, { useState } from 'react';
import { LAYER_COLORS, LAYER_NAMES, DOMAIN_NAMES } from '../types/concept.js';
import registry from '../core/ConceptRegistry.js';
import { ConceptCard } from './ui/ConceptCard.jsx';

/**
 * ConceptPage Component
 * 
 * @param {Object} props
 * @param {string} props.conceptId - ID of concept to display
 * @param {Set} props.completedConcepts - Set of completed concept IDs
 * @param {Function} props.onConceptClick - Handler for clicking related concepts
 */
export const ConceptPage = ({ 
  conceptId, 
  completedConcepts = new Set(),
  onConceptClick 
}) => {
  const concept = registry.get(conceptId);
  const [showVisualization, setShowVisualization] = useState(true);

  if (!concept) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Concept Not Found</h1>
          <p className="text-gray-400">The concept "{conceptId}" does not exist.</p>
        </div>
      </div>
    );
  }

  const layerColor = LAYER_COLORS[concept.layer];
  const VisualizationComponent = concept.visualization;

  // Get related concepts
  const prerequisites = concept.prerequisites?.map(id => registry.get(id)).filter(c => c) || [];
  const enables = registry.getEnabledBy(conceptId) || [];
  const related = concept.relatedConcepts?.map(id => registry.get(id)).filter(c => c) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Breadcrumb - Layer and Domain */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`
                  text-xs font-bold px-3 py-1 rounded
                  ${layerColor.bg} ${layerColor.text} border ${layerColor.border}
                `}>
                  {LAYER_NAMES[concept.layer]}
                </span>
                <span className="text-gray-600">/</span>
                <span className="text-sm text-gray-400">
                  {DOMAIN_NAMES[concept.domain]}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold mb-2">{concept.name}</h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {concept.metadata?.difficulty && (
                  <span>
                    Difficulty: {'⭐'.repeat(concept.metadata.difficulty)}
                  </span>
                )}
                {concept.metadata?.estimatedTime && (
                  <span>⏱️ {concept.metadata.estimatedTime}</span>
                )}
              </div>
            </div>

            {/* Toggle Visualization Button */}
            {VisualizationComponent && (
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30 transition-colors"
              >
                {showVisualization ? '📊 Hide Demo' : '📊 Show Demo'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Prerequisites Chain */}
        {prerequisites.length > 0 && (
          <section className="mb-8">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <h2 className="text-sm font-bold text-orange-400 mb-2">
                📚 Prerequisites Required
              </h2>
              <p className="text-sm text-gray-300 mb-3">
                To understand this concept, you should first learn:
              </p>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map(prereq => (
                  <button
                    key={prereq.id}
                    onClick={() => onConceptClick && onConceptClick(prereq)}
                    className={`
                      text-sm px-3 py-1.5 rounded-lg border transition-colors
                      ${completedConcepts.has(prereq.id)
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }
                    `}
                  >
                    {completedConcepts.has(prereq.id) && '✅ '}
                    {prereq.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Definition */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Definition</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {concept.definition}
                </p>
              </div>
            </section>

            {/* Intuition */}
            {concept.intuition && (
              <section className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">💡 Intuition</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {concept.intuition}
                </p>
              </section>
            )}

            {/* Interactive Visualization */}
            {VisualizationComponent && showVisualization && (
              <section>
                <h2 className="text-2xl font-bold mb-4">🎮 Interactive Demo</h2>
                <div className="bg-slate-900 rounded-xl border border-white/10 p-6">
                  <VisualizationComponent />
                </div>
              </section>
            )}

            {/* Properties/Axioms */}
            {(concept.properties || concept.axioms) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {concept.axioms ? '⚖️ Axioms' : '📋 Properties'}
                </h2>
                <ul className="space-y-2">
                  {(concept.axioms || concept.properties).map((item, idx) => (
                    <li 
                      key={idx}
                      className="flex gap-3 text-gray-300 bg-white/5 rounded-lg p-3"
                    >
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Examples */}
            {concept.examples && concept.examples.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">📝 Examples</h2>
                <div className="grid gap-4">
                  {concept.examples.map((example, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-900 rounded-xl border border-white/10 p-4"
                    >
                      <h3 className="text-lg font-bold text-white mb-2">
                        {example.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {example.description}
                      </p>
                      {example.details && (
                        <p className="text-sm text-gray-500 italic">
                          {example.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ML Relevance */}
            {concept.mlRelevance && (
              <section className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">
                  🤖 Why This Matters in ML
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {concept.mlRelevance}
                  </p>
                </div>
              </section>
            )}

            {/* Mathematical Formulation */}
            {concept.mathematicalFormulation && (
              <section>
                <h2 className="text-2xl font-bold mb-4">📐 Mathematical Formulation</h2>
                <div className="space-y-4">
                  {Object.entries(concept.mathematicalFormulation).map(([key, value]) => (
                    <div 
                      key={key}
                      className="bg-slate-900 rounded-xl border border-white/10 p-4"
                    >
                      <h3 className="text-sm font-bold text-cyan-400 uppercase mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                        {value}
                      </pre>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Assessment Questions */}
            {concept.assessmentQuestions && concept.assessmentQuestions.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">✅ Check Your Understanding</h2>
                <div className="space-y-4">
                  {concept.assessmentQuestions.map((q, idx) => (
                    <QuizQuestion key={idx} question={q} number={idx + 1} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* What This Enables */}
            {enables.length > 0 && (
              <section className="bg-slate-900 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-bold mb-3 text-emerald-400">
                  🚀 This Enables
                </h3>
                <div className="space-y-2">
                  {enables.map(enabled => (
                    <button
                      key={enabled.id}
                      onClick={() => onConceptClick && onConceptClick(enabled)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      {enabled.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Related Concepts */}
            {related.length > 0 && (
              <section className="bg-slate-900 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-bold mb-3">🔗 Related Concepts</h3>
                <div className="space-y-2">
                  {related.map(rel => (
                    <button
                      key={rel.id}
                      onClick={() => onConceptClick && onConceptClick(rel)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      {rel.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {concept.metadata?.tags && concept.metadata.tags.length > 0 && (
              <section className="bg-slate-900 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-bold mb-3">🏷️ Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {concept.metadata.tags.map(tag => (
                    <span 
                      key={tag}
                      className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * QuizQuestion Component - Interactive quiz question
 */
const QuizQuestion = ({ question, number }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setShowExplanation(true);
  };

  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
      <h4 className="font-bold text-white mb-3">
        {number}. {question.question}
      </h4>
      
      <div className="space-y-2 mb-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={selectedIndex !== null}
            className={`
              w-full text-left px-4 py-2 rounded-lg border transition-colors
              ${selectedIndex === null
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : idx === question.correctIndex
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : selectedIndex === idx
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-white/5 border-white/10 opacity-50'
              }
            `}
          >
            <span className="text-sm">
              {idx === question.correctIndex && selectedIndex !== null && '✅ '}
              {selectedIndex === idx && idx !== question.correctIndex && '❌ '}
              {option}
            </span>
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className={`
          p-3 rounded-lg text-sm
          ${isCorrect 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
          }
        `}>
          <p className="font-bold mb-1">
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className="text-gray-300">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default ConceptPage;