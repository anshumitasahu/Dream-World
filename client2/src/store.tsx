import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


interface FollowState {
    following: Record<string, boolean>;
    setFollowing: (userId: string, value: boolean) => void;
};

export const useStore = create<FollowState>()(
    persist(
        (set) => ({
            following: {},
            setFollowing: (userId, value) => set((state) => ({ following: { ...state.following, [userId]: value } })),
        }),
        {
            name: "follow-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);