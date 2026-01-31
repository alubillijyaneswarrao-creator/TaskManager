import api from "./api";
import { useState } from "react";

export default function Login({ setToken }) {
    const [username, setUser] = useState("");
    const [password, setPass] = useState("");

    const login = async () => {
        const res = await api.post("/login", null, {
            params: { username, password }
        });
        setToken(res.data.token);
    };

    return (
        <div>
            <h2>Login</h2>
            <input onChange={e => setUser(e.target.value)} />
            <input type="password" onChange={e => setPass(e.target.value)} />
            <button onClick={login}>Login</button>
        </div>
    );
}
