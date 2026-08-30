# AI Resume Analyzer

An AI-powered resume analysis web application that evaluates resumes for ATS compatibility and provides structured feedback including skills, strengths, weaknesses, and improvement suggestions.

## Features

- Upload PDF, DOC, or DOCX resumes
- Extract resume text automatically
- AI-powered resume analysis using Google Gemini
- ATS score out of 100
- Skills extraction
- Strengths identification
- Weakness detection
- Resume improvement suggestions
- Resume analysis history
- View previous analyses
- MongoDB database storage
- File validation and error handling
- Responsive React frontend

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### Database
- MongoDB
- MongoDB Atlas

### AI
- Google Gemini API

## Project Structure

```text
AI-Resume-Analyzer/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
