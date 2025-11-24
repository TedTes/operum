import React, { useState, useEffect, useRef } from 'react';

export const NeuralNetworkPlayground = ({ onClose }) => {
  const canvasRef = useRef(null);
  const networkCanvasRef = useRef(null);
  
  // Network architecture
  const [layers, setLayers] = useState([2, 4, 4, 1]); // [input, hidden1, hidden2, output]
  const [activation, setActivation] = useState('relu');
  
  // Training
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [learningRate, setLearningRate] = useState(0.1);
  const [batchSize, setBatchSize] = useState(10);
  
  // Data
  const [dataset, setDataset] = useState('circle');
  const [dataPoints, setDataPoints] = useState([]);
  const [testAccuracy, setTestAccuracy] = useState(0);
  const [trainLoss, setTrainLoss] = useState([]);
  
  // Network weights (simplified - in reality would be more complex)
  const [network, setNetwork] = useState(null);

  // Activation functions
  const activations = {
    relu: (x) => Math.max(0, x),
    sigmoid: (x) => 1 / (1 + Math.exp(-x)),
    tanh: (x) => Math.tanh(x)
  };

  const activationDerivatives = {
    relu: (x) => x > 0 ? 1 : 0,
    sigmoid: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
    tanh: (x) => 1 - Math.tanh(x) ** 2
  };

  // Initialize network
  useEffect(() => {
    initializeNetwork();
  }, [layers, activation]);

  const initializeNetwork = () => {
    const weights = [];
    const biases = [];
    
    for (let i = 0; i < layers.length - 1; i++) {
      const w = [];
      const b = [];
      
      for (let j = 0; j < layers[i + 1]; j++) {
        const neuronWeights = [];
        for (let k = 0; k < layers[i]; k++) {
          neuronWeights.push((Math.random() - 0.5) * 2);
        }
        w.push(neuronWeights);
        b.push((Math.random() - 0.5) * 2);
      }
      
      weights.push(w);
      biases.push(b);
    }
    
    setNetwork({ weights, biases, activations: [] });
  };

  // Generate dataset
  useEffect(() => {
    generateDataset(dataset);
  }, [dataset]);

  const generateDataset = (type) => {
    const points = [];
    const n = 100;
    
    for (let i = 0; i < n; i++) {
      let x, y, label;
      
      if (type === 'circle') {
        const r = Math.random();
        const theta = Math.random() * 2 * Math.PI;
        x = r * Math.cos(theta);
        y = r * Math.sin(theta);
        label = r < 0.5 ? 0 : 1;
      } else if (type === 'xor') {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        label = (x * y > 0) ? 1 : 0;
      } else if (type === 'spiral') {
        const theta = (i / n) * 4 * Math.PI;
        const r = theta / (4 * Math.PI);
        const noise = (Math.random() - 0.5) * 0.1;
        x = r * Math.cos(theta) + noise;
        y = r * Math.sin(theta) + noise;
        label = i < n / 2 ? 0 : 1;
      } else { // linear
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        label = x + y > 0 ? 1 : 0;
      }
      
      points.push({ x, y, label });
    }
    
    setDataPoints(points);
  };

  // Forward pass
  const forward = (input, net = network) => {
    if (!net) return { output: [0], activations: [] };
    
    let current = input;
    const allActivations = [current];
    
    for (let i = 0; i < net.weights.length; i++) {
      const nextLayer = [];
      
      for (let j = 0; j < net.weights[i].length; j++) {
        let sum = net.biases[i][j];
        
        for (let k = 0; k < current.length; k++) {
          sum += current[k] * net.weights[i][j][k];
        }
        
        // Apply activation (sigmoid for output layer, selected for hidden)
        const isOutputLayer = i === net.weights.length - 1;
        const activated = isOutputLayer ? 
          activations.sigmoid(sum) : 
          activations[activation](sum);
        
        nextLayer.push(activated);
      }
      
      current = nextLayer;
      allActivations.push(current);
    }
    
    return { output: current, activations: allActivations };
  };

  // Training step (simplified gradient descent)
  const trainStep = () => {
    if (!network) return;
    
    let totalLoss = 0;
    const batchPoints = dataPoints.slice(0, batchSize);
    
    // Accumulate gradients
    const gradWeights = network.weights.map(layer => 
      layer.map(neuron => neuron.map(() => 0))
    );
    const gradBiases = network.biases.map(layer => layer.map(() => 0));
    
    batchPoints.forEach(point => {
      const { output, activations } = forward([point.x, point.y]);
      const prediction = output[0];
      const target = point.label;
      
      // Loss (binary cross-entropy)
      const loss = -(target * Math.log(prediction + 1e-7) + 
                     (1 - target) * Math.log(1 - prediction + 1e-7));
      totalLoss += loss;
      
      // Backpropagation (simplified)
      let delta = [(prediction - target)];
      
      for (let i = network.weights.length - 1; i >= 0; i--) {
        const nextDelta = [];
        
        for (let j = 0; j < network.weights[i][0].length; j++) {
          let grad = 0;
          for (let k = 0; k < delta.length; k++) {
            grad += delta[k] * network.weights[i][k][j];
          }
          
          const isOutputLayer = i === network.weights.length - 1;
          const derivative = isOutputLayer ? 1 : activationDerivatives[activation](activations[i + 1][j]);
          nextDelta.push(grad * derivative);
        }
        
        for (let j = 0; j < network.weights[i].length; j++) {
          for (let k = 0; k < network.weights[i][j].length; k++) {
            gradWeights[i][j][k] += delta[j] * activations[i][k];
          }
          gradBiases[i][j] += delta[j];
        }
        
        delta = nextDelta;
      }
    });
    
    // Update weights
    const newWeights = network.weights.map((layer, i) =>
      layer.map((neuron, j) =>
        neuron.map((w, k) => w - learningRate * gradWeights[i][j][k] / batchSize)
      )
    );
    
    const newBiases = network.biases.map((layer, i) =>
      layer.map((b, j) => b - learningRate * gradBiases[i][j] / batchSize)
    );
    
    setNetwork({ ...network, weights: newWeights, biases: newBiases });
    setTrainLoss(prev => [...prev, totalLoss / batchSize].slice(-100));
    
    // Calculate accuracy
    let correct = 0;
    dataPoints.forEach(point => {
      const { output } = forward([point.x, point.y], { weights: newWeights, biases: newBiases });
      const prediction = output[0] > 0.5 ? 1 : 0;
      if (prediction === point.label) correct++;
    });
    setTestAccuracy(correct / dataPoints.length);
  };

  // Training loop
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        trainStep();
        setEpoch(prev => prev + 1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTraining, network, dataPoints, learningRate, batchSize]);

  // Draw decision boundary
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !network) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const resolution = 50;
    const cellWidth = width / resolution;
    const cellHeight = height / resolution;

    // Draw decision boundary heatmap
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = (i / resolution) * 2 - 1;
        const y = (j / resolution) * 2 - 1;
        
        const { output } = forward([x, y]);
        const prob = output[0];
        
        const r = Math.floor(prob * 255);
        const b = Math.floor((1 - prob) * 255);
        ctx.fillStyle = `rgba(${r}, 100, ${b}, 0.3)`;
        
        const screenX = (x + 1) * width / 2;
        const screenY = (1 - y) * height / 2;
        ctx.fillRect(screenX, screenY, cellWidth, cellHeight);
      }
    }

    // Draw data points
    dataPoints.forEach(point => {
      const screenX = (point.x + 1) * width / 2;
      const screenY = (1 - point.y) * height / 2;
      
      const { output } = forward([point.x, point.y]);
      const prediction = output[0] > 0.5 ? 1 : 0;
      const correct = prediction === point.label;
      
      ctx.fillStyle = point.label === 1 ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = correct ? '#22c55e' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

  }, [network, dataPoints]);

  // Draw network architecture
  useEffect(() => {
    const canvas = networkCanvasRef.current;
    if (!canvas || !network) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const layerSpacing = width / (layers.length + 1);
    const neuronRadius = 12;

    // Draw connections
    for (let i = 0; i < layers.length - 1; i++) {
      const x1 = layerSpacing * (i + 1);
      const x2 = layerSpacing * (i + 2);
      
      for (let j = 0; j < layers[i]; j++) {
        const y1 = height / 2 + (j - (layers[i] - 1) / 2) * 40;
        
        for (let k = 0; k < layers[i + 1]; k++) {
          const y2 = height / 2 + (k - (layers[i + 1] - 1) / 2) * 40;
          
          const weight = network.weights[i][k][j];
          const opacity = Math.min(Math.abs(weight) / 2, 1);
          const color = weight > 0 ? `rgba(34, 197, 94, ${opacity})` : `rgba(239, 68, 68, ${opacity})`;
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1 + neuronRadius, y1);
          ctx.lineTo(x2 - neuronRadius, y2);
          ctx.stroke();
        }
      }
    }

    // Draw neurons
    for (let i = 0; i < layers.length; i++) {
      const x = layerSpacing * (i + 1);
      
      for (let j = 0; j < layers[i]; j++) {
        const y = height / 2 + (j - (layers[i] - 1) / 2) * 40;
        
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = i === 0 ? '#3b82f6' : i === layers.length - 1 ? '#ef4444' : '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Layer labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const label = i === 0 ? 'Input' : i === layers.length - 1 ? 'Output' : `Hidden ${i}`;
      ctx.fillText(label, x, height - 10);
      ctx.fillText(`(${layers[i]})`, x, height - 25);
    }

  }, [network, layers]);

  const handleLayerChange = (index, value) => {
    const newLayers = [...layers];
    newLayers[index] = Math.max(1, Math.min(8, value));
    setLayers(newLayers);
    setEpoch(0);
    setTrainLoss([]);
  };

  const handleReset = () => {
    setIsTraining(false);
    setEpoch(0);
    setTrainLoss([]);
    setTestAccuracy(0);
    initializeNetwork();
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 md:p-6">
      {/* Top Row - Decision Boundary and Network */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Decision Boundary */}
        <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Decision Boundary</h3>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-auto border border-white/10 rounded-lg"
          />
        </div>

        {/* Network Architecture */}
        <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Network Architecture</h3>
          <canvas
            ref={networkCanvasRef}
            width={400}
            height={400}
            className="w-full h-auto border border-white/10 rounded-lg"
          />
        </div>
      </div>

      {/* Bottom Row - Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Dataset */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Dataset</h3>
          <div className="space-y-2">
            {['linear', 'circle', 'xor', 'spiral'].map(ds => (
              <button
                key={ds}
                onClick={() => {
                  setDataset(ds);
                  handleReset();
                }}
                className={`w-full p-2 rounded-lg border text-xs transition-all ${
                  dataset === ds
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-gray-300'
                }`}
              >
                {ds.charAt(0).toUpperCase() + ds.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Architecture</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Hidden Layer 1</label>
              <input
                type="number"
                min="1"
                max="8"
                value={layers[1]}
                onChange={(e) => handleLayerChange(1, Number(e.target.value))}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Hidden Layer 2</label>
              <input
                type="number"
                min="1"
                max="8"
                value={layers[2]}
                onChange={(e) => handleLayerChange(2, Number(e.target.value))}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Activation</label>
              <select
                value={activation}
                onChange={(e) => {
                  setActivation(e.target.value);
                  handleReset();
                }}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
              >
                <option value="relu">ReLU</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Training */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Training</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Learning Rate</label>
              <input
                type="number"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
              />
            </div>
            <button
              onClick={() => setIsTraining(!isTraining)}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                isTraining
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isTraining ? '⏸ Pause' : '▶ Train'}
            </button>
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-slate-900 rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Epoch:</span>
              <span className="font-mono text-white">{epoch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Accuracy:</span>
              <span className={`font-mono ${
                testAccuracy > 0.9 ? 'text-emerald-400' : 
                testAccuracy > 0.7 ? 'text-yellow-400' : 'text-orange-400'
              }`}>
                {(testAccuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Loss:</span>
              <span className="font-mono text-purple-400">
                {trainLoss.length > 0 ? trainLoss[trainLoss.length - 1].toFixed(4) : '0.0000'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};