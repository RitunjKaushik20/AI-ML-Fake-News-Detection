# Fake News Detection System

A basic fake news detection web application built with Node.js, Natural Language Processing (NLP), and Machine Learning. This project is designed for academic purposes and demonstrates fundamental concepts of text classification.

## 🚀 Features

- **Text Analysis**: Users can input news headlines or articles for analysis
- **URL Support**: Placeholder for URL-based news analysis (requires web scraping implementation)
- **Real-time Predictions**: Instant classification as REAL or FAKE news
- **Confidence Scores**: Shows prediction confidence with probability breakdown
- **Modern UI**: Clean, responsive web interface with smooth animations
- **Model Information**: Displays trained model statistics and status

## 🛠 Technology Stack

### Backend
- **Node.js**: Server runtime environment
- **Express.js**: Web framework for API endpoints
- **Natural**: NLP library for text processing
- **ml-naivebayes**: Machine learning library for Naive Bayes classification
- **csv-parser**: CSV file parsing for dataset loading

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with animations and responsive design
- **Vanilla JavaScript**: Client-side functionality and API interactions

### Machine Learning
- **Algorithm**: Naive Bayes Classifier
- **Feature Extraction**: Bag of Words (BoW)
- **Text Preprocessing**: Lowercasing, Tokenization, Stopword Removal, Stemming

## 📁 Project Structure

```
fake-news-detection/
│
├── dataset/
│   └── news.csv              # Training dataset with labeled news
│
├── model/
│   └── model.json            # Trained model and vocabulary (generated)
│
├── src/
│   ├── train.js              # Model training script
│   ├── predict.js            # Prediction functionality
│   └── server.js             # Express server and API endpoints
│
├── public/
│   ├── index.html            # Main web page
│   ├── style.css             # Styling and animations
│   └── script.js             # Frontend JavaScript
│
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 📦 Installation and Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Steps

1. **Clone or download the project**
   ```bash
   cd fake-news-detection
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Train the model**
   ```bash
   npm run train
   ```
   This will:
   - Load the dataset from `dataset/news.csv`
   - Preprocess the text data
   - Train the Naive Bayes classifier
   - Save the trained model to `model/model.json`
   - Display accuracy metrics

4. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open the application**
   Visit `http://localhost:3000` in your web browser

## 🔧 Usage

### Web Interface
1. Open the application in your browser
2. Choose between "Text Input" or "URL Input" tabs
3. Enter the news headline or article text (minimum 10 characters)
4. Click "Analyze News" to get predictions
5. View results including:
   - Prediction (REAL/FAKE)
   - Confidence score
   - Probability breakdown
   - Processing statistics

### API Endpoints

#### Predict Single Text
```http
POST /api/predict
Content-Type: application/json

{
  "text": "Your news text here..."
}
```

#### Batch Prediction
```http
POST /api/predict/batch
Content-Type: application/json

{
  "texts": ["Text 1", "Text 2", "Text 3"]
}
```

#### Model Information
```http
GET /api/model/info
```

#### Health Check
```http
GET /api/health
```

## 📊 Model Performance

The trained model achieves approximately **85-95% accuracy** on the test dataset, depending on the random split during training. However, this accuracy is specific to the training data and may not generalize well to real-world news.

### Training Metrics
- **Dataset Size**: 60 labeled samples (30 REAL, 30 FAKE)
- **Training Split**: 80% training, 20% testing
- **Vocabulary Size**: ~200-300 unique words after preprocessing
- **Algorithm**: Naive Bayes with Bag of Words features

## ⚠️ Important Limitations and Disclaimer

### Technical Limitations

1. **Small Dataset**: The model is trained on a very small dataset (60 samples) and may not generalize well
2. **Basic Algorithm**: Uses simple Naive Bayes classifier, not sophisticated deep learning models
3. **Limited Context**: Analyzes text patterns only, doesn't consider source credibility, fact-checking, or external verification
4. **No Real-time Learning**: Model doesn't update with new data or user feedback
5. **Language Specific**: Trained on English text only

### Accuracy Limitations

1. **False Positives**: May classify legitimate news as fake
2. **False Negatives**: May fail to detect sophisticated fake news
3. **Context Blind**: Cannot understand sarcasm, irony, or nuanced reporting
4. **Source Agnostic**: Doesn't consider the reputation or reliability of news sources

### Ethical Considerations

1. **Not for Production**: This system is for educational purposes only
2. **Human Verification Required**: Always verify information through multiple reliable sources
3. **Potential for Misuse**: Automated classification should not replace critical thinking
4. **Bias Concerns**: Training data may contain biases that affect predictions

### Disclaimer

> **This is an academic project demonstrating basic NLP and ML concepts. The system should NOT be used as the sole basis for determining the authenticity of news content. The predictions are based solely on text patterns learned from a limited training dataset and may produce incorrect results. Always consult multiple reliable sources, fact-checking organizations, and use critical thinking when evaluating news content.**

## 🔬 How It Works

### Text Preprocessing Pipeline
1. **Lowercasing**: Convert all text to lowercase
2. **Tokenization**: Split text into individual words
3. **Stopword Removal**: Remove common words (the, a, an, etc.)
4. **Stemming**: Reduce words to their root form
5. **Feature Extraction**: Convert processed text to numerical vectors using Bag of Words

### Classification Process
1. **Input**: Raw news text
2. **Preprocessing**: Apply NLP pipeline
3. **Feature Vector**: Create numerical representation
4. **Prediction**: Use trained Naive Bayes model
5. **Output**: Classification with confidence scores

## 🚧 Potential Improvements

### Dataset Enhancements
- Use larger, diverse datasets (thousands of samples)
- Include multiple languages and writing styles
- Add temporal data to track evolving fake news patterns
- Implement data augmentation techniques

### Algorithm Improvements
- Implement TF-IDF instead of Bag of Words
- Use more advanced classifiers (SVM, Random Forest)
- Add deep learning models (LSTM, BERT)
- Implement ensemble methods

### Feature Engineering
- Add sentiment analysis features
- Include readability scores
- Extract named entities and relationships
- Add source credibility features

### System Enhancements
- Implement web scraping for URL analysis
- Add real-time model updating
- Include user feedback mechanisms
- Add fact-checking API integrations

## 🐛 Troubleshooting

### Common Issues

1. **Model not loading**
   - Run `npm run train` to create the model file
   - Check if `model/model.json` exists

2. **Server won't start**
   - Ensure all dependencies are installed: `npm install`
   - Check if port 3000 is available

3. **Poor predictions**
   - The model has limited training data
   - Try with different text samples
   - Remember this is a demonstration project

4. **Frontend not working**
   - Check browser console for errors
   - Ensure server is running
   - Verify API endpoints are accessible

## 📚 References and Resources

- [Natural NPM Package](https://www.npmjs.com/package/natural)
- [ML-NaiveBayes](https://www.npmjs.com/package/ml-naivebayes)
- [Express.js Documentation](https://expressjs.com/)
- [Naive Bayes Classifier](https://en.wikipedia.org/wiki/Naive_Bayes_classifier)
- [Bag of Words Model](https://en.wikipedia.org/wiki/Bag-of-words_model)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

This is an academic project. For educational purposes, you may:
- Modify the code for learning
- Experiment with different algorithms
- Expand the dataset
- Improve the user interface

## 📞 Support

For questions about this academic project:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Consult the documentation of the used libraries

---

**Remember**: This tool is for educational purposes only. Always verify news through multiple reliable sources and use critical thinking when evaluating information.
