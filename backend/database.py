import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URL)

db = client[DATABASE_NAME]

resume_collection = db["resume_analysis"]