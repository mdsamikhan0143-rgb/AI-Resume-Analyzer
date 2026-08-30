from fastapi import APIRouter, HTTPException
from database import db
from models.user import User
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token

router = APIRouter()

# Signup
@router.post("/signup")
def signup(user: User):
    existing = db.users.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    data = user.dict()
    data["password"] = hash_password(user.password)

    db.users.insert_one(data)

    return {"message": "User registered successfully"}


# Login
@router.post("/login")
def login(user: User):
    existing = db.users.find_one({"email": user.email})

    if not existing:
        raise HTTPException(status_code=401, detail="Invalid Email")

    if not verify_password(user.password, existing["password"]):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_access_token({"email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }