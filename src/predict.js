const fs = require('fs');
const path = require('path');
const natural = require('natural');

// Simple Logistic Regression implementation
class LogisticRegression {
    constructor(options = {}) {
        this.learningRate = options.learningRate || 0.01;
        this.iterations = options.iterations || 1000;
        this.weights = null;
        this.bias = null;
    }

    _sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    train(X, y) {
        const numSamples = X.length;
        const numFeatures = X[0].length;
        
        // Initialize weights and bias
        this.weights = new Array(numFeatures).fill(0);
        this.bias = 0;

        // Gradient descent
        for (let iter = 0; iter < this.iterations; iter++) {
            let dw = new Array(numFeatures).fill(0);
            let db = 0;
            
            for (let i = 0; i < numSamples; i++) {
                const linearOutput = X[i].reduce((sum, xi, j) => sum + xi * this.weights[j], 0) + this.bias;
                const prediction = this._sigmoid(linearOutput);
                const error = prediction - y[i];
                
                for (let j = 0; j < numFeatures; j++) {
                    dw[j] += error * X[i][j];
                }
                db += error;
            }
            
            // Update weights and bias
            for (let j = 0; j < numFeatures; j++) {
                this.weights[j] -= this.learningRate * dw[j] / numSamples;
            }
            this.bias -= this.learningRate * db / numSamples;
        }
    }

    predict(X) {
        const linearOutput = X.reduce((sum, xi, j) => sum + xi * this.weights[j], 0) + this.bias;
        return this._sigmoid(linearOutput);
    }
}

class FakeNewsPredictor {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stopwords = new Set(natural.stopwords);
        this.stemmer = natural.PorterStemmer;
        this.vocabulary = new Map();
        this.model = null;
        this.modelLoaded = false;
    }

    // Load trained model from file
    loadModel(modelPath = path.join(__dirname, '../model/model.json')) {
        try {
            if (!fs.existsSync(modelPath)) {
                throw new Error(`Model file not found: ${modelPath}`);
            }

            const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
            
            // Reconstruct vocabulary
            this.vocabulary = new Map(modelData.vocabulary);
            
            // Reconstruct Logistic Regression model
            this.model = new LogisticRegression();
            this.model.weights = modelData.weights;
            this.model.bias = modelData.bias;
            
            this.modelLoaded = true;
            
            console.log(`Model loaded successfully!`);
            console.log(`Vocabulary size: ${this.vocabulary.size} words`);
            console.log(`Model trained on: ${modelData.metadata.timestamp}`);
            
            return true;
        } catch (error) {
            console.error('Error loading model:', error.message);
            return false;
        }
    }

    // Text preprocessing: lowercase, tokenization, stopwords removal, stemming
    preprocessText(text) {
        if (!text) return [];
        
        // Convert to lowercase
        text = text.toLowerCase();
        
        // Tokenize
        let tokens = this.tokenizer.tokenize(text);
        
        // Remove stopwords and non-alphabetic characters, then apply stemming
        tokens = tokens
            .filter(token => token.match(/^[a-z]+$/)) // Keep only alphabetic tokens
            .filter(token => !this.stopwords.has(token)) // Remove stopwords
            .map(token => this.stemmer.stem(token)); // Apply stemming
        
        return tokens;
    }

    // Convert text to feature vector using Bag of Words
    textToVector(text) {
        const tokens = this.preprocessText(text);
        const vector = new Array(this.vocabulary.size).fill(0);
        
        tokens.forEach(token => {
            if (this.vocabulary.has(token)) {
                const index = this.vocabulary.get(token);
                vector[index]++; // Increment count for Bag of Words
            }
        });
        
        return vector;
    }

    // Predict if news is fake or real
    predict(text) {
        if (!this.modelLoaded) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input text. Please provide a non-empty string.');
        }

        // Convert text to feature vector
        const vector = this.textToVector(text);
        
        // Check if vector has any features (words found in vocabulary)
        const hasFeatures = vector.some(val => val > 0);
        if (!hasFeatures) {
            return {
                prediction: 'UNCERTAIN',
                confidence: 0,
                message: 'No recognizable words found in text. Unable to make prediction.'
            };
        }

        // Make prediction using logistic regression
        const probability = this.model.predict(vector);
        const prediction = probability >= 0.5 ? 'REAL' : 'FAKE';
        
        // Calculate confidence score
        const confidence = Math.abs(probability - 0.5) * 2 * 100; // Convert to 0-100 scale
        
        return {
            prediction: prediction,
            confidence: confidence.toFixed(2),
            probabilities: {
                REAL: (probability * 100).toFixed(2),
                FAKE: ((1 - probability) * 100).toFixed(2)
            },
            processedText: this.preprocessText(text).slice(0, 10), // Show first 10 processed tokens
            message: `Predicted as ${prediction} with ${confidence.toFixed(2)}% confidence`
        };
    }

    // Batch prediction for multiple texts
    predictBatch(texts) {
        if (!Array.isArray(texts)) {
            throw new Error('Input must be an array of texts.');
        }

        return texts.map((text, index) => {
            try {
                const result = this.predict(text);
                return {
                    index: index,
                    text: text,
                    ...result
                };
            } catch (error) {
                return {
                    index: index,
                    text: text,
                    error: error.message
                };
            }
        });
    }

    // Get model information
    getModelInfo() {
        if (!this.modelLoaded) {
            return { error: 'Model not loaded' };
        }

        return {
            vocabularySize: this.vocabulary.size,
            modelType: 'Logistic Regression',
            preprocessing: [
                'Lowercasing',
                'Tokenization',
                'Stopword removal',
                'Stemming',
                'Bag of Words feature extraction'
            ],
            classes: ['REAL', 'FAKE'],
            status: 'Ready for predictions'
        };
    }
}

module.exports = FakeNewsPredictor;
