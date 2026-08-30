from fastapi import APIRouter, UploadFile, File
import os
import shutil

from utils.resume_parser import extract_text
from utils.ai_analyzer import analyze_resume
from database import resume_collection


resume_router = APIRouter()

UPLOAD_FOLDER = "uploads"

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================================================
# 1. UPLOAD AND ANALYZE RESUME
# =========================================================

@resume_router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    # Save uploaded resume
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Extract text from resume
    text = extract_text(file_path)

    # Send resume text to Gemini
    analysis = analyze_resume(text)

    # Save data in MongoDB
    resume_data = {
        "filename": file.filename,
        "resume_text": text,
        "analysis": analysis
    }

    result = resume_collection.insert_one(resume_data)

    return {
        "message": "Resume analyzed successfully",
        "id": str(result.inserted_id),
        "filename": file.filename,
        "analysis": analysis
    }


# =========================================================
# 2. GET RESUME ANALYSIS HISTORY
# =========================================================

@resume_router.get("/history")
async def get_resume_history():

    resumes = resume_collection.find(
        {},
        {
            "resume_text": 0
        }
    ).sort("_id", -1)

    history = []

    for resume in resumes:

        history.append({
            "id": str(resume["_id"]),
            "filename": resume.get("filename", ""),
            "analysis": resume.get("analysis", "")
        })

    return history