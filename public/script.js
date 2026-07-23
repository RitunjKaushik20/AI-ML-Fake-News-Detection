// DOM Elements
const elements = {
    // Tab elements
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Input elements
    newsText: document.getElementById('news-text'),
    newsUrl: document.getElementById('news-url'),
    charCount: document.getElementById('char-count'),
    analyzeBtn: document.getElementById('analyze-btn'),
    
    // Result elements
    results: document.getElementById('results'),
    resultCard: document.getElementById('result-card'),
    predictionBadge: document.getElementById('prediction-badge'),
    predictionIcon: document.getElementById('prediction-icon'),
    predictionText: document.getElementById('prediction-text'),
    confidenceValue: document.getElementById('confidence-value'),
    realProb: document.getElementById('real-prob'),
    fakeProb: document.getElementById('fake-prob'),
    realValue: document.getElementById('real-value'),
    fakeValue: document.getElementById('fake-value'),
    inputLength: document.getElementById('input-length'),
    wordsProcessed: document.getElementById('words-processed'),
    processingTime: document.getElementById('processing-time'),
    
    // Action buttons
    newAnalysisBtn: document.getElementById('new-analysis-btn'),
    shareResultsBtn: document.getElementById('share-results-btn'),
    
    // Model info elements
    modelType: document.getElementById('model-type'),
    vocabSize: document.getElementById('vocab-size'),
    modelStatus: document.getElementById('model-status'),
    
    // Toast elements
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    toastClose: document.getElementById('toast-close')
};

// State
let currentTab = 'text';
let isAnalyzing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeInputHandlers();
    initializeActionButtons();
    initializeToast();
    loadModelInfo();
    
    // Focus on text input
    elements.newsText.focus();
});

// Tab functionality
function initializeTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab contents
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    currentTab = tabName;
    
    // Focus on the appropriate input
    if (tabName === 'text') {
        elements.newsText.focus();
    } else {
        elements.newsUrl.focus();
    }
}

// Input handlers
function initializeInputHandlers() {
    // Character counter for text input
    elements.newsText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        elements.charCount.textContent = length;
        
        // Change color if approaching limit
        if (length > 4500) {
            elements.charCount.style.color = '#dc3545';
        } else if (length > 4000) {
            elements.charCount.style.color = '#ffc107';
        } else {
            elements.charCount.style.color = '#666';
        }
    });
    
    // Analyze button
    elements.analyzeBtn.addEventListener('click', analyzeNews);
    
    // Enter key support
    elements.newsText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            analyzeNews();
        }
    });
    
    elements.newsUrl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            analyzeNews();
        }
    });
}

// Action buttons
function initializeActionButtons() {
    elements.newAnalysisBtn.addEventListener('click', () => {
        resetAnalysis();
    });
    
    elements.shareResultsBtn.addEventListener('click', () => {
        shareResults();
    });
}

// Toast notification
function initializeToast() {
    elements.toastClose.addEventListener('click', () => {
        hideToast();
    });
}

function showToast(message, type = 'info') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type}`;
    
    // Show toast
    setTimeout(() => {
        elements.toast.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    elements.toast.classList.remove('show');
}

// Main analysis function
async function analyzeNews() {
    if (isAnalyzing) return;
    
    const input = currentTab === 'text' 
        ? elements.newsText.value.trim()
        : elements.newsUrl.value.trim();
    
    // Validation
    if (!input) {
        showToast('Please enter text or URL to analyze', 'warning');
        return;
    }
    
    if (currentTab === 'text' && input.length < 10) {
        showToast('Text must be at least 10 characters long', 'warning');
        return;
    }
    
    if (currentTab === 'url') {
        showToast('URL analysis is not implemented. Please paste the text content directly.', 'warning');
        return;
    }
    
    // Start analysis
    isAnalyzing = true;
    setAnalyzingState(true);
    
    const startTime = Date.now();
    
    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: input })
        });
        
        const data = await response.json();
        const endTime = Date.now();
        
        if (!data.success) {
            throw new Error(data.error || 'Analysis failed');
        }
        
        // Display results
        displayResults(data.data, endTime - startTime);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showToast(`Analysis failed: ${error.message}`, 'error');
    } finally {
        isAnalyzing = false;
        setAnalyzingState(false);
    }
}

function setAnalyzingState(analyzing) {
    elements.analyzeBtn.disabled = analyzing;
    
    if (analyzing) {
        elements.analyzeBtn.querySelector('.btn-text').style.display = 'none';
        elements.analyzeBtn.querySelector('.btn-loader').style.display = 'inline-flex';
    } else {
        elements.analyzeBtn.querySelector('.btn-text').style.display = 'inline-flex';
        elements.analyzeBtn.querySelector('.btn-loader').style.display = 'none';
    }
}

function displayResults(data, processingTime) {
    const { prediction, confidence, probabilities } = data;
    
    // Update prediction badge
    elements.predictionBadge.className = `prediction-badge ${prediction.toLowerCase()}`;
    elements.predictionText.textContent = prediction;
    
    // Set icon based on prediction
    if (prediction === 'REAL') {
        elements.predictionIcon.textContent = '✅';
    } else if (prediction === 'FAKE') {
        elements.predictionIcon.textContent = '🚫';
    } else {
        elements.predictionIcon.textContent = '❓';
    }
    
    // Update confidence
    elements.confidenceValue.textContent = `${confidence}%`;
    
    // Update probability bars
    const realProb = parseFloat(probabilities.REAL);
    const fakeProb = parseFloat(probabilities.FAKE);
    
    elements.realProb.style.width = `${realProb}%`;
    elements.fakeProb.style.width = `${fakeProb}%`;
    elements.realValue.textContent = `${realProb}%`;
    elements.fakeValue.textContent = `${fakeProb}%`;
    
    // Update analysis info
    const inputLength = currentTab === 'text' 
        ? elements.newsText.value.length 
        : elements.newsUrl.value.length;
    
    elements.inputLength.textContent = `${inputLength} characters`;
    elements.wordsProcessed.textContent = data.processedText ? data.processedText.length : 'N/A';
    elements.processingTime.textContent = `${processingTime}ms`;
    
    // Show results section
    elements.results.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        elements.results.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
    
    showToast('Analysis completed successfully!', 'success');
}

function displayFinalDecision(finalDecision) {
    const { prediction, confidence } = finalDecision;
    
    // Update final prediction badge
    elements.finalPredictionBadge.className = `prediction-badge ${prediction.toLowerCase()}`;
    elements.finalPredictionText.textContent = prediction;
    
    // Set icon based on prediction
    if (prediction === 'REAL') {
        elements.finalPredictionIcon.textContent = '✅';
    } else if (prediction === 'FAKE') {
        elements.finalPredictionIcon.textContent = '🚫';
    } else {
        elements.finalPredictionIcon.textContent = '❓';
    }
    
    // Update confidence
    elements.finalConfidenceValue.textContent = `${confidence}%`;
}

function displayAgreementStatus(agreement) {
    if (agreement) {
        elements.agreementIcon.textContent = '🤝';
        elements.agreementText.textContent = 'ML and AI analyses agree';
        elements.agreementStatus.style.background = '#d4edda';
        elements.agreementText.style.color = '#155724';
    } else {
        elements.agreementIcon.textContent = '⚠️';
        elements.agreementText.textContent = 'ML and AI analyses disagree - review required';
        elements.agreementStatus.style.background = '#fff3cd';
        elements.agreementText.style.color = '#856404';
    }
}

function displayReasoning(reasoning) {
    elements.reasoningList.innerHTML = '';
    reasoning.forEach(reason => {
        const li = document.createElement('li');
        li.textContent = reason;
        elements.reasoningList.appendChild(li);
    });
}

function displayMLAnalysis(mlAnalysis) {
    const { prediction, confidence, probabilities } = mlAnalysis;
    
    elements.mlPrediction.textContent = prediction;
    elements.mlConfidence.textContent = `${confidence}%`;
    
    // Update probability bars
    const realProb = parseFloat(probabilities.REAL);
    const fakeProb = parseFloat(probabilities.FAKE);
    
    elements.mlRealProb.style.width = `${realProb}%`;
    elements.mlFakeProb.style.width = `${fakeProb}%`;
    elements.mlRealValue.textContent = `${realProb}%`;
    elements.mlFakeValue.textContent = `${fakeProb}%`;
}

function displayGeminiAnalysis(geminiAnalysis) {
    const { verdict, confidence, isPlausible, reasoning, redFlags } = geminiAnalysis;
    
    elements.geminiVerdict.textContent = verdict;
    elements.geminiConfidence.textContent = `${confidence}%`;
    elements.geminiPlausible.textContent = isPlausible ? 'Yes' : 'No';
    elements.geminiReasoningText.textContent = reasoning;
    
    // Display red flags
    elements.redFlagsList.innerHTML = '';
    if (redFlags && redFlags.length > 0) {
        redFlags.forEach(flag => {
            const li = document.createElement('li');
            li.textContent = flag;
            elements.redFlagsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No red flags detected';
        li.style.color = '#28a745';
        elements.redFlagsList.appendChild(li);
    }
}

function updateProcessingInfo(input, processingTime) {
    elements.inputLength.textContent = `${input.length} characters`;
    elements.wordsProcessed.textContent = 'N/A'; // Not available in hybrid mode
    elements.processingTime.textContent = `${processingTime}ms`;
}

function resetAnalysis() {
    // Clear inputs
    elements.newsText.value = '';
    elements.newsUrl.value = '';
    elements.charCount.textContent = '0';
    
    // Hide results
    elements.results.style.display = 'none';
    
    // Reset to text tab
    switchTab('text');
    
    // Focus on text input
    elements.newsText.focus();
    
    showToast('Ready for new analysis', 'info');
}

function shareResults() {
    const prediction = elements.predictionText.textContent;
    const confidence = elements.confidenceValue.textContent;
    const input = currentTab === 'text' 
        ? elements.newsText.value.trim()
        : elements.newsUrl.value.trim();
    
    const shareText = `Fake News Detection Results:\n\n` +
        `Input: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"\n` +
        `Prediction: ${prediction}\n` +
        `Confidence: ${confidence}\n\n` +
        `Analyzed with Fake News Detection System`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Fake News Detection Results',
            text: shareText
        }).catch(err => {
            console.log('Share cancelled or failed:', err);
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    try {
        textarea.select();
        document.execCommand('copy');
        showToast('Results copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy results', 'error');
    } finally {
        document.body.removeChild(textarea);
    }
}

// Load model information
async function loadModelInfo() {
    try {
        const response = await fetch('/api/model/info');
        const data = await response.json();
        
        if (data.success) {
            const { vocabularySize, modelType, status } = data.data;
            
            elements.modelType.textContent = modelType || 'Loading...';
            elements.vocabSize.textContent = vocabularySize ? `${vocabularySize} words` : 'Loading...';
            elements.modelStatus.textContent = status || 'Loading...';
            
            if (status === 'Ready for predictions') {
                elements.modelStatus.style.color = '#28a745';
            } else {
                elements.modelStatus.style.color = '#dc3545';
            }
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Failed to load model info:', error);
        elements.modelType.textContent = 'Error';
        elements.vocabSize.textContent = 'Error';
        elements.modelStatus.textContent = 'Error loading model';
        elements.modelStatus.style.color = '#dc3545';
    }
}

// Utility functions
function formatTime(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    } else {
        return `${(ms / 1000).toFixed(2)}s`;
    }
}

function truncateText(text, maxLength = 100) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

// Error handling for network issues
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('Connection lost. Some features may not work.', 'error');
});

// Prevent accidental page leave during analysis
window.addEventListener('beforeunload', (e) => {
    if (isAnalyzing) {
        e.preventDefault();
        e.returnValue = 'Analysis is in progress. Are you sure you want to leave?';
    }
});
