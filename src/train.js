const fs = require('fs');
const csv = require('csv-parser');
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

class FakeNewsTrainer {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stopwords = new Set(natural.stopwords);
        this.stemmer = natural.PorterStemmer;
        this.vocabulary = new Map();
        this.model = null;
        this.trainingData = [];
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

    // Build vocabulary from training data
    buildVocabulary(texts) {
        let wordIndex = 0;
        
        texts.forEach(text => {
            const tokens = this.preprocessText(text);
            tokens.forEach(token => {
                if (!this.vocabulary.has(token)) {
                    this.vocabulary.set(token, wordIndex++);
                }
            });
        });
        
        console.log(`Vocabulary built with ${this.vocabulary.size} unique words`);
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

    // Load dataset from CSV file
    async loadDataset(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.text && row.label) {
                        results.push({
                            text: row.text.trim(),
                            label: row.label.toUpperCase() // Ensure consistent labels
                        });
                    }
                })
                .on('end', () => {
                    console.log(`Loaded ${results.length} samples from dataset`);
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    // Train the model
    async train() {
        try {
            console.log('Starting training process...');
            
            // Load dataset
            const dataset = await this.loadDataset('./dataset/news.csv');
            
            // Shuffle dataset for better training
            const shuffled = dataset.sort(() => Math.random() - 0.5);
            
            // Split into training (80%) and testing (20%)
            const splitIndex = Math.floor(shuffled.length * 0.8);
            const trainingData = shuffled.slice(0, splitIndex);
            const testData = shuffled.slice(splitIndex);
            
            console.log(`Training samples: ${trainingData.length}`);
            console.log(`Testing samples: ${testData.length}`);
            
            // Build vocabulary from training data
            const trainingTexts = trainingData.map(item => item.text);
            this.buildVocabulary(trainingTexts);
            
            // Prepare training data for logistic regression
            const X_train = [];
            const y_train = [];
            
            trainingData.forEach(item => {
                const vector = this.textToVector(item.text);
                X_train.push(vector);
                // Convert labels to binary: REAL = 1, FAKE = 0
                y_train.push(item.label === 'REAL' ? 1 : 0);
            });
            
            // Train the Logistic Regression model
            console.log('Training Logistic Regression model...');
            this.model = new LogisticRegression({
                learningRate: 0.1,
                iterations: 1000
            });
            this.model.train(X_train, y_train);
            
            // Evaluate on test data
            console.log('Evaluating model...');
            let correct = 0;
            let total = 0;
            const predictions = [];
            
            testData.forEach(item => {
                const vector = this.textToVector(item.text);
                const probability = this.model.predict(vector);
                const predictedLabel = probability >= 0.5 ? 'REAL' : 'FAKE';
                predictions.push({
                    text: item.text,
                    actual: item.label,
                    predicted: predictedLabel,
                    probability: probability
                });
                
                if (predictedLabel === item.label) {
                    correct++;
                }
                total++;
            });
            
            const accuracy = (correct / total) * 100;
            console.log(`\n=== Model Evaluation ===`);
            console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
            console.log(`Correct predictions: ${correct}/${total}`);
            
            // Show some sample predictions
            console.log('\n=== Sample Predictions ===');
            predictions.slice(0, 5).forEach((pred, i) => {
                console.log(`${i + 1}. Actual: ${pred.actual}, Predicted: ${pred.predicted}`);
                console.log(`   Text: "${pred.text.substring(0, 80)}..."`);
                console.log('');
            });
            
            // Save model and vocabulary
            await this.saveModel();
            
            console.log('Training completed successfully!');
            
        } catch (error) {
            console.error('Training error:', error);
        }
    }

    // Save model and vocabulary to files
    async saveModel() {
        const modelData = {
            vocabulary: Array.from(this.vocabulary.entries()),
            weights: this.model.weights,
            bias: this.model.bias,
            modelType: 'LogisticRegression',
            metadata: {
                vocabularySize: this.vocabulary.size,
                modelType: 'Logistic Regression',
                timestamp: new Date().toISOString()
            }
        };
        
        // Ensure model directory exists
        if (!fs.existsSync('./model')) {
            fs.mkdirSync('./model');
        }
        
        fs.writeFileSync('./model/model.json', JSON.stringify(modelData, null, 2));
        console.log('Model saved to ./model/model.json');
    }
}

// Run training if this script is executed directly
if (require.main === module) {
    const trainer = new FakeNewsTrainer();
    trainer.train();
}

module.exports = FakeNewsTrainer;
