import { useState, useEffect, useCallback } from "react";
import api from "./api";
import Auth from "./Auth";
import "./index.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [dayId, setDayId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rate, setRate] = useState(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [streaks, setStreaks] = useState([]);
  const [lastDeleted, setLastDeleted] = useState(null);

  const load = useCallback(async () => {
    if (!dayId) return;
    setTasks((await api.get(`/tasks/${dayId}`)).data);
    setRate((await api.get(`/analytics/${dayId}`)).data.rate);
    setStreaks((await api.get("/streaks")).data);
  }, [dayId]);

  useEffect(() => { load(); }, [load]);

  if (!token) return <Auth setToken={setToken} />;

  return (
    <div className="container">
      <div className="header">
        <h1>📅 Day Tracker</h1>
      </div>

      <div className="card">
        <input
          type="date"
          className="date-input"
          onChange={async e => {
            const r = await api.post("/day", null, { params: { date: e.target.value } });
            setDayId(r.data.day_id);
          }}
        />
      </div>

      <div className="card">
        <div className="progress-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${rate}%` }} />
          </div>
          <div className="progress-text">{rate}% completed</div>
        </div>
      </div>

      <div className="card">
        <input className="input" placeholder="Task" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="textarea" placeholder="Reflection" value={desc} onChange={e => setDesc(e.target.value)} />
        <button className="button" onClick={async () => {
          if (!title || !dayId) return;
          await api.post("/task", { day_id: dayId, title, description: desc });
          setTitle(""); setDesc(""); load();
        }}>➕ Add Task</button>
      </div>

      <div className="card">
        {tasks.map(t => (
          <div key={t[0]} className={`task ${t[3] ? "completed" : ""}`}>
            <input type="checkbox" checked={t[3]} onChange={async () => {
              await api.put(`/task/${t[0]}`, { completed: !t[3], description: t[4] });
              load();
            }} />
            <div className="task-main">
              <div className="task-title">{t[2]}</div>
              <input className="task-desc-input" value={t[4] || ""}
                onChange={async e => {
                  await api.put(`/task/${t[0]}`, { completed: t[3], description: e.target.value });
                  load();
                }} />
            </div>
            <div className="task-time">{t[5]}</div>
            <button className="task-delete" onClick={async () => {
              setLastDeleted(t);
              await api.delete(`/task/${t[0]}`);
              load();
            }}>✕</button>
          </div>
        ))}
      </div>

      {lastDeleted && (
        <div className="card">
          Task deleted.
          <button className="button" onClick={async () => {
            await api.post("/task", { day_id: dayId, title: lastDeleted[2], description: lastDeleted[4] });
            setLastDeleted(null);
            load();
          }}>Undo</button>
        </div>
      )}

      <div className="card">
        <h3>🔥 Streaks</h3>
        <div className="streak-grid">
          {streaks.map((s, i) => (
            <div key={i} className={`streak-cell ${s[1] ? "done" : ""}`} title={s[0]} />
          ))}
        </div>
      </div>
    </div>
  );
}
