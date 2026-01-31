import api from "./api";
import { useState } from "react";

export default function Todo({ user }) {
    const [task, setTask] = useState("");

    const addTask = async () => {
        await api.post("/add-task", null, {
            params: { user, task, urgency: 5, importance: 4 }
        });
        alert("Task Added");
    };

    return (
        <div>
            <h2>To-Do</h2>
            <input onChange={e => setTask(e.target.value)} />
            <button onClick={addTask}>Add</button>
        </div>
    );
}
