import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    // token intentionally omitted — axios reads sees_access_token from
    // localStorage directly; storing it here too creates a stale-copy risk.
    setAuth: (user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setAuth: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),
            logout: () => {
                set({ user: null, isAuthenticated: false });
                localStorage.removeItem("sees_access_token");
                // Refresh token must also be cleared so a logged-out session
                // can't be silently revived via the axios refresh interceptor.
                localStorage.removeItem("sees_refresh_token");
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
