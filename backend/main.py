import os
import json
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="토닥토닥 Backend")

# Allow CORS for mobile and web dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')
BaseModel_Sentiment = model # Just for reference if needed

import sqlite3
from typing import List, Optional

# --- Database Setup ---
DB_PATH = "feelconomy.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT,
            phone TEXT,
            password TEXT
        )
    ''')
    # Diary entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            content TEXT,
            lang TEXT,
            sentiment TEXT,
            score INTEGER,
            summary TEXT,
            prescription TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users (email)
        )
    ''')
    # Insert default test user if not exists
    cursor.execute("SELECT email FROM users WHERE email = ?", ('test@test.com',))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (email, name, phone, password) VALUES (?, ?, ?, ?)",
            ('test@test.com', 'Test User', '010-0000-0000', '1234')
        )
    
    conn.commit()
    conn.close()

init_db()

class DiaryEntry(BaseModel):
    content: str
    lang: str = "ko"
    user_email: Optional[str] = None

class UserSignup(BaseModel):
    email: str
    name: str
    phone: str
    password: Optional[str] = "1234"

class ChatMessage(BaseModel):
    message: str
    history: list = []
    lang: str = "ko"
    user_email: Optional[str] = None

def extract_json(text):
    # Extracts JSON from text, handling markdown blocks if present
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            return None
    return None

@app.get("/")
async def root():
    return {"status": "ok", "message": "Feelconomy Backend is running"}

@app.post("/analyze-sentiment")
async def analyze_sentiment(entry: DiaryEntry):
    print(f"Analyzing sentiment ({entry.lang}) for: {entry.content[:50]}...")
    
    lang_map = {
        "ko": "Korean",
        "en": "English",
        "ph": "Tagalog",
        "zh": "Chinese (Simplified)"
    }
    target_lang = lang_map.get(entry.lang, "Korean")

    try:
        prompt = f"""
        당신은 전문 심리 상담가이자 '토닥토닥' 앱의 AI 엔진입니다. 
        사용자가 작성한 다음 일기 내용을 분석하여 심리 상태를 수치화하고 맞춤형 처방을 내려주세요.
        
        응답은 반드시 아래의 JSON 형식을 유지해야 하며, 모든 텍스트 값은 반드시 {target_lang}로 작성하세요:
        {{
            "index": 0-100 사이의 정수 (100: 매우 평온함, 0: 높은 스트레스/불안),
            "sentiment": "감정의 핵심 키워드",
            "summary": "감정 분석 결과에 대한 따뜻한 요약 (한 문장)",
            "prescription": "현재 감정에 어울리는 행동이나 콘텐츠 추천"
        }}

        일기 내용: {entry.content}
        """
        response = model.generate_content(prompt)
        print(f"Gemini response: {response.text[:100]}...")
        result = extract_json(response.text)
        
        if result:
            db_data = (
                entry.user_email, entry.content, entry.lang, 
                result.get("sentiment"), result.get("index"), 
                result.get("summary"), result.get("prescription")
            )
        else:
            print("Using fallback for DB save.")
            fallbacks = {
                "en": {"sentiment": "Analyzing...", "summary": "Heart felt analysis.", "prescription": "Relax."},
                "ko": {"sentiment": "분석 완료", "summary": "마음을 담아 분석해 드렸어요.", "prescription": "잠시 휴식을 취해보세요."}
            }
            fb = fallbacks.get(entry.lang, fallbacks["ko"])
            result = {
                "index": 50,
                "sentiment": fb["sentiment"],
                "summary": fb["summary"],
                "prescription": fb["prescription"]
            }
            db_data = (
                entry.user_email, entry.content, entry.lang, 
                result["sentiment"], result["index"], 
                result["summary"], result["prescription"]
            )

        # Save to DB if user_email is provided
        if entry.user_email:
            try:
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO diary_entries 
                    (user_email, content, lang, sentiment, score, summary, prescription)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', db_data)
                conn.commit()
                conn.close()
                print(f"Saved entry for {entry.user_email}")
            except Exception as db_err:
                print(f"Database error: {db_err}")

        return result
    except Exception as e:
        print(f"Critical error in analyze_sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_ai(chat: ChatMessage):
    lang_map = {
        "ko": "Korean",
        "en": "English",
        "ph": "Tagalog",
        "zh": "Chinese (Simplified)"
    }
    target_lang = lang_map.get(chat.lang, "Korean")

    # Fetch user's recent diary history to provide context
    history_context = ""
    if chat.user_email:
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT content, sentiment, score, date 
                FROM diary_entries 
                WHERE user_email = ? 
                ORDER BY date DESC LIMIT 3
            """, (chat.user_email,))
            rows = cursor.fetchall()
            conn.close()
            
            if rows:
                history_context = "\n[사용자의 최근 감정 기록 배경]\n"
                for r in reversed(rows):
                    history_context += f"- {r[3]}: {r[0]} (감정: {r[1]}, 지수: {r[2]}%)\n"
        except Exception as e:
            print(f"Error fetching history for chat: {e}")

    try:
        # Improved Persona Prompt
        system_instruction = f"""당신은 '토닥토닥'의 AI 친구 '토닥이'입니다. 
당신은 사용자의 고민을 들어주고 진심으로 공감해주는 아주 친한 친구예요.
말투는 딱딱한 존댓말보다는 아주 따뜻하고 다정하며, 자연스러운 대화체(~해요, ~군, ~이다 등)를 사용하세요.
사용자의 이름을 부르거나, '그랬구나', '정말 고생 많았어' 같은 공감의 표현을 적극적으로 사용해주세요.
질문은 하나씩만 하고, 대화가 끊기지 않도록 따뜻하게 말을 이어가세요.
모든 대화는 반드시 {target_lang}로 진행하세요.

{history_context}
"""
        
        # Convert incoming history list to Gemini history format
        # chat.history is expected to be a list of {"role": "user"|"model", "parts": [{"text": "..."}]}
        gemini_history = []
        if chat.history:
            for msg in chat.history:
                # Basic mapping if format is different
                role = "user" if msg.get("role") == "user" else "model"
                content = msg.get("content") or msg.get("text")
                if content:
                    gemini_history.append({"role": role, "parts": [content]})
        
        chat_session = model.start_chat(history=gemini_history) 
        # Prepend system instruction to the actual message to guide this specific turn if session is new
        # Or better, send it as the first message if history is empty
        full_message = f"{system_instruction}\n\n사용자: {chat.message}" if not gemini_history else chat.message
        
        response = chat_session.send_message(full_message)
        return {"response": response.text}
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/signup")
async def signup(user: UserSignup):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO users (email, name, phone, password) VALUES (?, ?, ?, ?)", 
                       (user.email, user.name, user.phone, user.password))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "User registered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(auth: dict):
    email = auth.get("email")
    password = auth.get("password")
    print(f"Login attempt: {email}")
    
    # Check for hardcoded admin
    if email == "admin" and password == "admin1234":
        print("Admin login successful")
        return {"status": "success", "user": {"email": "admin", "name": "Administrator", "role": "admin"}}

    # Regular users: Check email AND password
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT email, name, password FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        stored_email, stored_name, stored_password = user
        # Verification: password must match
        if password == stored_password:
            print(f"User login successful: {email}")
            return {"status": "success", "user": {"email": stored_email, "name": stored_name, "role": "user"}}
        else:
            print(f"Login failed: Incorrect password for {email}")
            return {"status": "fail", "message": "Incorrect password"}
    else:
        print(f"Login outcome: User not found for {email} (status: new)")
        # For new users / social login check
        return {"status": "new", "message": "User not found"}

@app.get("/history/{email}")
async def get_history(email: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT sentiment, score, summary, prescription, date FROM diary_entries WHERE user_email = ? ORDER BY date DESC", (email,))
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        history.append({
            "sentiment": r[0],
            "score": r[1],
            "summary": r[2],
            "prescription": r[3],
            "date": r[4]
        })
    return {"history": history}

@app.get("/admin/users")
async def get_all_users():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT email, name, phone, password FROM users")
        rows = cursor.fetchall()
        conn.close()
        
        users = []
        # Always prepend the system administrator
        users.append({
            "email": "admin",
            "name": "Administrator (System)",
            "phone": "N/A",
            "password": "admin1234"
        })
        
        for r in rows:
            if r[0] != "admin": # Skip if already added or if someone manually registered as admin
                users.append({
                    "email": r[0],
                    "name": r[1],
                    "phone": r[2],
                    "password": r[3]
                })
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/users/{email}")
async def delete_user(email: str):
    print(f"Request to delete user: {email}")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email = ?", (email,))
        print(f"Deleted from users: {cursor.rowcount} rows")
        # Also delete their diary entries
        cursor.execute("DELETE FROM diary_entries WHERE user_email = ?", (email,))
        print(f"Deleted from diary_entries: {cursor.rowcount} rows")
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"User {email} deleted"}
    except Exception as e:
        print(f"Error deleting user {email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/admin/users/{email}")
async def update_user(email: str, user_update: UserSignup):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET name = ?, phone = ? WHERE email = ?", 
                       (user_update.name, user_update.phone, email))
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"User {email} updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
