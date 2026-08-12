import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.error("VITE_API_URL is not configured.");
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// ==========================================
// Register
// ==========================================

export async function register({
    username,
    email,
    password,
}) {
    try {
        const response = await api.post(
            "/api/auth/register",
            {
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password,
            }
        );

        return response.data;
    } catch (err) {
        console.error(
            "REGISTER API ERROR:",
            err
        );

        console.error(
            "Server response:",
            err?.response?.data
        );

        throw err;
    }
}

// ==========================================
// Login
// ==========================================

export async function login({
    email,
    password,
}) {
    try {
        const response = await api.post(
            "/api/auth/login",
            {
                email: email.trim().toLowerCase(),
                password,
            }
        );

        return response.data;
    } catch (err) {
        console.error(
            "LOGIN API ERROR:",
            err
        );

        console.error(
            "Server response:",
            err?.response?.data
        );

        throw err;
    }
}

// ==========================================
// Logout
// ==========================================

export async function logout() {
    try {
        const response = await api.get(
            "/api/auth/logout"
        );

        return response.data;
    } catch (err) {
        console.error(
            "LOGOUT API ERROR:",
            err
        );

        console.error(
            "Server response:",
            err?.response?.data
        );

        throw err;
    }
}

// ==========================================
// Get Current User
// ==========================================

export async function getMe() {
    try {
        const response = await api.get(
            "/api/auth/get-me"
        );

        return response.data;
    } catch (err) {
        console.error(
            "GET ME API ERROR:",
            err
        );

        console.error(
            "Server response:",
            err?.response?.data
        );

        throw err;
    }
}

export default api;