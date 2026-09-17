import { useState } from "react";
import { useStore } from "../store";

const baseUrl = "http://localhost:3000";

interface FollowProps {
    userId: string;
    initialIsFollowing?: boolean;
};

export default function Follow({ userId, initialIsFollowing = false }: FollowProps) {
    const isFollowing = useStore((s) => s.following[userId] ?? initialIsFollowing);
    const setFollowing = useStore((s) => s.setFollowing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFollow = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/users/${userId}/follow`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "user is being followed");
            };

            setFollowing(userId, true);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/users/${userId}/follow`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Failed to unfollow user");
            };

            setFollowing(userId, false);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    const handleClick = () => {
        if (loading) return;
        isFollowing ? handleUnfollow() : handleFollow();
    }

    return (
        <div>
            <button
                onClick={handleClick}
                className="cursor-pointer text-sm"
                disabled={loading}
            >
                {loading ? (
                    "..."
                ) : isFollowing ? (
                    <div className="group border border-neutral-600 bg-black text-white px-2.5 py-1.5 rounded-full hover:text-red-400">
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:block">Unfollow</span>
                    </div>
                ) : (
                    <div className="px-2.5 py-1.5 hover:bg-white/90 bg-white text-black rounded-full">Follow</div>
                )}
            </button>
            <div>
                {error && <p style={{ color: "red" }} className="text-xs">{error}</p>}
            </div>
        </div>
    )

}