"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, User, ApiError } from "./api";

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "startup_navigator_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Restore session from localStorage on first load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setUser(parsed.user);
                setToken(parsed.token);
            }
        } catch {
            // corrupted or missing storage; treat as logged out
        } finally {
            setIsLoading(false);
        }
    }, []);

    function persistSession(newToken: string, newUser: User) {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
    }

    async function login(email: string, password: string) {
        const res = await authApi.login(email, password);
        persistSession(res.access_token, res.user);
    }

    async function signup(name: string, email: string, password: string) {
        const res = await authApi.signup(name, email, password);
        persistSession(res.access_token, res.user);
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
        router.push("/");
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}

export { ApiError };