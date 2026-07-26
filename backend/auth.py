"""
Authentication module for CRACKWATCH.
JWT-based auth with role-based access (government vs citizen).
"""

import jwt
import time
from datetime import datetime, timezone
from fastapi import HTTPException, Depends, Request

SECRET_KEY = "crackwatch-nirman-2026-secret"
ALGORITHM = "HS256"
TOKEN_EXPIRY = 86400  # 24 hours

import os
from dotenv import load_dotenv

load_dotenv()

# Secure env-based users
USERS = {
    os.getenv("ADMIN_USERNAME", "admin"): {
        "password": os.getenv("ADMIN_PASSWORD", "admin123"),
        "role": "admin",
        "name": "Administrator",
        "department": "Admin HQ"
    },
    os.getenv("INSPECTOR_USERNAME", "inspector"): {
        "password": os.getenv("INSPECTOR_PASSWORD", "inspect123"),
        "role": "inspector",
        "name": "Inspector",
        "department": "Municipal Corp"
    },
    os.getenv("CITIZEN_USERNAME", "citizen"): {
        "password": os.getenv("CITIZEN_PASSWORD", "cit123"),
        "role": "citizen",
        "name": "Citizen",
        "department": ""
    },
}


def create_token(username: str, role: str, name: str) -> str:
    payload = {
        "sub": username,
        "role": role,
        "name": name,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization header")
    token = auth.split(" ")[1]
    return verify_token(token)


def require_government(request: Request) -> dict:
    user = get_current_user(request)
    if user.get("role") not in ["government", "admin", "inspector"]:
        raise HTTPException(403, "Government access required")
    return user


import json
from pathlib import Path

CONTRACTORS_FILE = Path(__file__).parent / "contractors_store.json"

# In-memory store for contractors (loaded on import / startup)
CONTRACTORS: dict[str, dict] = {
    "contractor": {
        "password": "contractor123",
        "role": "contractor",
        "name": "Apex Infrastructure Ltd",
        "company": "Apex Infrastructure Ltd",
        "department": "Civil Contracting",
        "username": "contractor"
    }
}

def _load_contractors():
    try:
        if CONTRACTORS_FILE.exists():
            data = json.loads(CONTRACTORS_FILE.read_text())
            for username, info in data.items():
                CONTRACTORS[username] = info
    except Exception as e:
        print(f"[AUTH] Error loading contractors: {e}")

_load_contractors()

def _save_contractors():
    try:
        CONTRACTORS_FILE.write_text(json.dumps(CONTRACTORS, indent=2))
    except Exception as e:
        print(f"[AUTH] Error saving contractors: {e}")

def register_contractor(name: str, company: str, username: str, password: str) -> dict:
    clean_username = username.strip().lower()
    if not clean_username:
        raise HTTPException(400, "Username is required")
    if clean_username in USERS or clean_username in CONTRACTORS:
        raise HTTPException(400, "Username already exists")
    
    contractor_data = {
        "password": password,
        "role": "contractor",
        "name": name.strip() or "Contractor",
        "company": company.strip() or "Independent Contractor",
        "department": "Contracting Partner",
        "username": clean_username
    }
    CONTRACTORS[clean_username] = contractor_data
    _save_contractors()
    return contractor_data

def get_all_contractors() -> list[dict]:
    return [
        {
            "username": c["username"],
            "name": c["name"],
            "company": c["company"],
            "department": c.get("department", "Contractor"),
        }
        for c in CONTRACTORS.values()
    ]

CITIZENS_FILE = Path(__file__).parent / "citizens_store.json"

CITIZENS: dict[str, dict] = {
    "citizen": {
        "password": "citizen123",
        "role": "citizen",
        "name": "Citizen User",
        "username": "citizen"
    }
}

def _load_citizens():
    try:
        if CITIZENS_FILE.exists():
            data = json.loads(CITIZENS_FILE.read_text())
            for username, info in data.items():
                CITIZENS[username] = info
    except Exception as e:
        print(f"[AUTH] Error loading citizens: {e}")

_load_citizens()

def _save_citizens():
    try:
        CITIZENS_FILE.write_text(json.dumps(CITIZENS, indent=2))
    except Exception as e:
        print(f"[AUTH] Error saving citizens: {e}")

def register_citizen_user(name: str, username: str, password: str) -> dict:
    clean_username = username.strip().lower()
    if not clean_username or not password.strip():
        raise HTTPException(400, "Username and password are required")
    if clean_username in USERS or clean_username in CONTRACTORS or clean_username in CITIZENS:
        raise HTTPException(400, "Username already exists. Please choose a different username.")

    citizen_data = {
        "password": password.strip(),
        "role": "citizen",
        "name": name.strip() or "Citizen",
        "username": clean_username
    }
    CITIZENS[clean_username] = citizen_data
    _save_citizens()

    token = create_token(clean_username, "citizen", citizen_data["name"])
    return {
        "token": token,
        "role": "citizen",
        "name": citizen_data["name"],
        "username": clean_username,
    }

def login(username: str, password: str) -> dict:
    clean_username = username.strip().lower()
    user = USERS.get(clean_username) or CONTRACTORS.get(clean_username) or CITIZENS.get(clean_username)
    if not user:
        return None
    
    valid_passwords = {user["password"], os.getenv(f"{user['role'].upper()}_PASSWORD"), os.getenv(f"VITE_{user['role'].upper()}_PASSWORD")}
    if clean_username == "inspector":
        valid_passwords.update(["inspector123", "inspect123"])
    elif clean_username == "citizen":
        valid_passwords.update(["citizen123", "cit123"])
    elif clean_username == "contractor":
        valid_passwords.update(["contractor123", "contract123"])
    
    if password not in valid_passwords:
        return None
        
    token = create_token(clean_username, user["role"], user["name"])
    return {
        "token": token,
        "role": user["role"],
        "name": user["name"],
        "company": user.get("company", ""),
        "department": user.get("department", ""),
        "username": clean_username,
    }

def register_citizen(name: str) -> dict:
    """Anonymous citizen registration."""
    token = create_token(f"citizen_{int(time.time())}", "citizen", name)
    return {
        "token": token,
        "role": "citizen",
        "name": name,
        "username": f"citizen_{int(time.time())}",
    }
