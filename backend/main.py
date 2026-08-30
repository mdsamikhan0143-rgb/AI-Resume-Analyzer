from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.resume import resume_router

app = FastAPI()

# 👇 ADD THIS CORS BLOCK HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resume_router, prefix="/resume")


@app.get("/")
def home():
    return {"message": "AI Resume Analyzer Backend Running"}