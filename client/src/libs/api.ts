import axios from "axios";
import { clearToken, getToken } from "./auth";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if ((error as { response?: { status?: number } } | null)?.response?.status === 401) {
            clearToken();
        }
        return Promise.reject(error);
    },
);

export default api;

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    const message = (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message
    return message ?? fallback;
}