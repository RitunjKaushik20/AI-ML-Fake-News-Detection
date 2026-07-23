const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const FakeNewsPredictor = require('./predict');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize predictor
const predictor = new FakeNewsPredictor();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Load model on server start
let modelLoaded = false;
try {
    modelLoaded = predictor.loadModel();
    if (modelLoaded) {
        console.log('✅ Model loaded successfully');
    } else {
        console.log('❌ Failed to load model');
    }
} catch (error) {
    console.error('Error loading model:', error.message);
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        modelLoaded: modelLoaded,
        timestamp: new Date().toISOString()
    });
});

// Get model information
app.get('/api/model/info', (req, res) => {
    try {
        const info = predictor.getModelInfo();
        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Predict single news text
app.post('/api/predict', (req, res) => {
    try {
        if (!modelLoaded) {
            return res.status(503).json({
                success: false,
                error: 'Model not loaded. Please train the model first.'
            });
        }

        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Text is required and must be a string'
            });
        }

        if (text.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Text must be at least 10 characters long'
            });
        }

        const result = predictor.predict(text.trim());

        res.json({
            success: true,
            data: {
                input: text,
                prediction: result.prediction,
                confidence: result.confidence,
                probabilities: result.probabilities,
                message: result.message,
                processedText: result.processedText
            }
        });

    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Predict multiple news texts (batch)
app.post('/api/predict/batch', (req, res) => {
    try {
        if (!modelLoaded) {
            return res.status(503).json({
                success: false,
                error: 'Model not loaded. Please train the model first.'
            });
        }

        const { texts } = req.body;

        if (!Array.isArray(texts)) {
            return res.status(400).json({
                success: false,
                error: 'Texts must be an array'
            });
        }

        if (texts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Texts array cannot be empty'
            });
        }

        if (texts.length > 10) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 10 texts allowed per batch'
            });
        }

        const results = predictor.predictBatch(texts);

        res.json({
            success: true,
            data: {
                results: results,
                totalProcessed: results.length,
                successful: results.filter(r => !r.error).length,
                failed: results.filter(r => r.error).length
            }
        });

    } catch (error) {
        console.error('Batch prediction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Analyze URL content (placeholder - would need web scraping in production)
app.post('/api/analyze-url', (req, res) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'URL is required and must be a string'
            });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }

        // In a real application, you would scrape the URL content here
        // For this demo, we'll return a message indicating URL analysis
        res.json({
            success: false,
            error: 'URL analysis not implemented in this demo. Please copy and paste the text content directly.',
            note: 'In a production environment, this endpoint would scrape the URL content and analyze it.'
        });

    } catch (error) {
        console.error('URL analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server only if run directly (not imported as module for Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Fake News Detection Server`);
        console.log(`📍 Server running at: http://localhost:${PORT}`);
        console.log(`📊 Model Status: ${modelLoaded ? '✅ Loaded' : '❌ Not Loaded'}`);
        console.log(`\n📖 API Endpoints:`);
        console.log(`   GET  /api/health          - Health check`);
        console.log(`   GET  /api/model/info      - Model information`);
        console.log(`   POST /api/predict         - Predict single text`);
        console.log(`   POST /api/predict/batch    - Predict multiple texts`);
        console.log(`   POST /api/analyze-url      - Analyze URL (placeholder)`);
        console.log(`\n💡 If model is not loaded, run: npm run train`);
        console.log(`\n🌐 Visit http://localhost:${PORT} to use the web interface`);
    });
}

module.exports = app;

