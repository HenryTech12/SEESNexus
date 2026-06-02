import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "../types";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem("sees_access_token");
                localStorage.removeItem("auth-storage");
            },
            updateUser: (updatedFields) =>
                set((state) => ({
                    user: state.user
                        ? { ...state.user, ...updatedFields }
                        : null,
                })),
        }),
        {
            name: "auth-storage",
        }
    )
);
