# CommentVibe

CommentVibe is a full-stack web application that analyzes YouTube video comments using machine learning and LLMs to provide sentiment analysis, visualizations, and AI-generated feedback. The project consists of a React frontend and a Python FastAPI backend, with multiple ML models and integration with the Mistral LLM for advanced summarization.

---

## 🚀 Features

- **YouTube Comment Scraping:** Fetches comments from YouTube videos.
- **Sentiment Analysis:** Classifies comments as positive, negative, or neutral using various ML models.
- **Visualization:** Displays sentiment distribution via pie charts.
- **AI Feedback:** Uses Mistral LLM to generate overall, positive, and negative feedback summaries.
- **Team Info:** Meet the team behind the project.
- **Responsive UI:** Built with React and styled for modern usability.

---

## 🧠 Machine Learning Models

We experimented with several models for sentiment analysis:

- **BERT:** Fine-tuned for comment sentiment classification.
- **Logistic Regression**
- **Multinomial Naive Bayes**
- **Random Forest Classifier**
- **Support Vector Machine (SVM)**

The best-performing model was selected and deployed in the backend (`final_model/`).

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Axios, CSS
- **Backend:** Python, FastAPI, requests, custom ML pipeline, Mistral LLM API
- **ML/AI:** scikit-learn, transformers (for BERT), Mistral LLM (via Ollama API)
- **Visualization:** Matplotlib (for pie charts)

---

## 📁 Project Structure

```
CommentVibe/
│
├── Backend/
│   └── Python/
│       └── Server/
│           ├── main.py           # FastAPI backend
│           ├── final_model/      # Trained ML model and configs
│           ├── requirements.txt  # Python dependencies
│           └── comments.csv      # Scraped comments
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Analyze.jsx       # Main analysis page
│   │   │   └── About.jsx         # Team info
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── api/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── ML Models/
│   ├── BERT.ipynb
│   ├── Logistic Regression.ipynb
│   ├── Multinomial Naive Bayes.ipynb
│   ├── Random Forest Classifier.ipynb
│   └── SVM.ipynb
└── README.md
```

---

## ⚙️ How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CommentVibe.git
cd CommentVibe
```

---

### 2. Backend Setup

#### a. Create a Python Virtual Environment

```bash
cd Backend/Python/Server
python -m venv myvenv
# On Windows:
myvenv\Scripts\activate
# On Mac/Linux:
source myvenv/bin/activate
```

#### b. Install Dependencies

```bash
pip install -r requirements.txt
```

#### c. Download/Place Model Files

Ensure the `final_model/` directory contains the trained model files (`config.json`, `model.safetensors`, etc.).

#### d. Start the FastAPI Server

```bash
uvicorn main:app --reload
```

The backend will run at `http://localhost:8000`.

#### e. Start Ollama (Mistral LLM API)

Make sure Ollama is running locally and the Mistral model is available at `http://localhost:11434`.  
See [Ollama documentation](https://ollama.com/) for setup.

---

### 3. Frontend Setup

```bash
cd ../../../Frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` (or as shown in your terminal).

---

## 🖼️ Screenshots

_Add screenshots here to showcase the UI and features._

---

## 👥 Team

See the [About](src/pages/About.jsx) page for team details.

---

## 🤖 API Endpoints

- `/fetch-comments-csv?videoId=...` — Scrape and store comments for a video
- `/sentiment-analysis` — Get sentiment pie chart
- `/feedback` — Get overall feedback from Mistral
- `/positive-feedback` — Get positive feedback summary from Mistral
- `/negative-feedback` — Get negative feedback summary from Mistral

---

## 📝 Notes

- You need valid YouTube video links for analysis.
- The Mistral LLM API (Ollama) must be running locally for feedback endpoints to work.
- For best results, use the BERT model in `final_model/`.

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [scikit-learn](https://scikit-learn.org/)
- [transformers](https://huggingface.co/docs/transformers/index)
- [Ollama](https://ollama.com/)
- [Mistral LLM](https://mistral.ai/)
