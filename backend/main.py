from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from jose import jwt
from datetime import datetime
from pydantic import BaseModel
from database import cursor, conn
from auth import hash_password, verify_password, create_token, SECRET_KEY, ALGORITHM

app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"]
)

def get_user(token=Depends(security)):
    payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    return payload["sub"]

class User(BaseModel):
    username: str
    password: str

class Task(BaseModel):
    day_id: int
    title: str
    description: str

class UpdateTask(BaseModel):
    completed: bool
    description: str

@app.post("/signup")
def signup(u: User):
    try:
        cursor.execute("INSERT INTO users VALUES (?,?)",
                       (u.username, hash_password(u.password)))
        conn.commit()
        return {"msg": "ok"}
    except:
        raise HTTPException(400, "User exists")

@app.post("/login")
def login(u: User):
    cursor.execute("SELECT password FROM users WHERE username=?", (u.username,))
    d = cursor.fetchone()
    if not d or not verify_password(u.password, d[0]):
        raise HTTPException(401)
    return {"token": create_token(u.username)}

@app.post("/day")
def create_day(date: str, user=Depends(get_user)):
    cursor.execute("INSERT INTO days (user,date) VALUES (?,?)",
                   (user, date))
    conn.commit()
    return {"day_id": cursor.lastrowid}

@app.post("/task")
def add_task(t: Task, user=Depends(get_user)):
    cursor.execute(
        "INSERT INTO tasks VALUES (NULL,?,?,?,?,?)",
        (t.day_id, t.title, 0, t.description,
         datetime.now().strftime("%H:%M:%S"))
    )
    conn.commit()
    return {"msg": "added"}

@app.put("/task/{id}")
def update_task(id: int, t: UpdateTask, user=Depends(get_user)):
    cursor.execute(
        "UPDATE tasks SET completed=?, description=? WHERE id=?",
        (int(t.completed), t.description, id)
    )
    conn.commit()
    return {"msg": "updated"}

@app.delete("/task/{id}")
def delete_task(id: int, user=Depends(get_user)):
    cursor.execute("DELETE FROM tasks WHERE id=?", (id,))
    conn.commit()
    return {"msg": "deleted"}

@app.get("/tasks/{day_id}")
def tasks(day_id: int, user=Depends(get_user)):
    cursor.execute("SELECT * FROM tasks WHERE day_id=?", (day_id,))
    return cursor.fetchall()

@app.get("/analytics/{day_id}")
def analytics(day_id: int, user=Depends(get_user)):
    cursor.execute(
        "SELECT COUNT(*), SUM(completed) FROM tasks WHERE day_id=?",
        (day_id,))
    t, c = cursor.fetchone()
    c = c or 0
    return {"rate": round((c/t)*100,1) if t else 0}

@app.get("/streaks")
def streaks(user=Depends(get_user)):
    cursor.execute("""
    SELECT date, SUM(completed)=COUNT(*)
    FROM tasks JOIN days ON tasks.day_id=days.id
    WHERE user=?
    GROUP BY date
    ORDER BY date
    """, (user,))
    return cursor.fetchall()
