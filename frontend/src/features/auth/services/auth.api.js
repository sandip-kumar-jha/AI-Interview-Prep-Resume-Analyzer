import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
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
                username,
                email,
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
                email,
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