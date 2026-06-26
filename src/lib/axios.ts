import axios from "axios";
import { env } from "#/env";

const TOKEN_KEY = "smart-siem_token";

export const http = axios.create({
    baseURL: env.VITE_API_URL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" }
});

http.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
});


http.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY)
            // TODO: Redirect to login page 
        }

        return Promise.reject(err);
    }
)
