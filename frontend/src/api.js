import axios from "axios";

const api = axios.create({
    baseURL: "https://taskmanager-1-e7ua.onrender.com"
});

api.interceptors.request.use(cfg => {
    const t = localStorage.getItem("token");
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

export default api;

