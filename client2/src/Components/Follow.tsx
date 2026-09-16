import { useState } from "react";

const baseUrl = "http://localhost:4000";

interface FollowProps {
    userId: string;
    initialIsFollowing?: boolean;
}

export default function Follow({ userId, initialIsFollowing = false }: FollowProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
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
                }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "user is being followed");
            }

            setIsFollowing(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
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
                }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Failed to unfollow user");
            }

            setIsFollowing(false);
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
                className="bg-white text-black px-2 rounded-md"
            >
                {loading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
            <div>
                {error && <p style={{ color: "red" }} className="text-xs">{error}</p>}
            </div>
        </div>
    )
}

