import { useState } from "react";
import api from "./api";

export default function Auth({ setToken }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");

    const login = async () => {
        const r = await api.post("/login", { username: u, password: p });
        localStorage.setItem("token", r.data.token);
        setToken(r.data.token);
    };

    const signup = async () => {
        await api.post("/signup", { username: u, password: p });
        login();
    };

    return (
        <div className="container">
            <div className="card">
                <input className="input" placeholder="Username" onChange={e => setU(e.target.value)} />
                <input className="input" type="password" placeholder="Password" onChange={e => setP(e.target.value)} />
                <button className="button" onClick={login}>Login</button>
                <button className="button" onClick={signup}>Signup</button>
            </div>
        </div>
    );
}
