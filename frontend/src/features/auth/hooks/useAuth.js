import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../auth.context";

import {
    login,
    register,
    logout,
    getMe,
} from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    const {
        user,
        setUser,
        loading,
        setLoading,
    } = context;

    // Prevent duplicate getMe calls
    // especially in React StrictMode during development.
    const hasFetchedUser = useRef(false);

    const handleLogin = async ({
        email,
        password,
    }) => {
        setLoading(true);

        try {
            const data = await login({
                email,
                password,
            });

            if (data?.user) {
                setUser(data.user);
            }

            return data;
        } catch (err) {
            console.error(
                "Login failed:",
                err
            );

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({
        username,
        email,
        password,
    }) => {
        setLoading(true);

        try {
            const data = await register({
                username,
                email,
                password,
            });

            if (data?.user) {
                setUser(data.user);
            }

            return data;
        } catch (err) {
            console.error(
                "Registration failed:",
                err
            );

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();

            setUser(null);
        } catch (err) {
            console.error(
                "Logout failed:",
                err
            );

            // Even if backend logout fails,
            // remove the user from frontend state.
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetchedUser.current) {
            return;
        }

        hasFetchedUser.current = true;

        let isMounted = true;

        const getAndSetUser = async () => {
            console.log(
                "Checking authenticated user..."
            );

            try {
                const data = await getMe();

                if (!isMounted) {
                    return;
                }

                if (data?.user) {
                    console.log(
                        "Current user:",
                        data.user
                    );

                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                // 401 means user is not logged in.
                // Do not treat it as a frontend crash.
                console.log(
                    "No authenticated user."
                );

                setUser(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getAndSetUser();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
    };
};