from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "123"
ALGORITHM = "HS256"

def create_access_token(data):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)