import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SideBar from "../SideBar/SideBar";

interface UserSummary {
    id: string;
    name: string;
    username: string;
}

const baseUrl = "http://localhost:3000";

export default function FollowList() {
    const { type } = useParams<{ type: "following" | "followers" }>();
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchList();
    }, [type]);

    const fetchList = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/user/profile`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch (${res.status})`);
            }

            const json = await res.json();
            const data = json.data;

            const list: UserSummary[] =
                type === "following"
                    ? data.following.map((f: any) => f.following)
                    : data.follower.map((f: any) => f.follower);

            setUsers(list);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const title = type === "following" ? "Following" : "Followers";

    return (
        <div className="bg-black text-white w-screen h-screen p-2 overflow-scroll flex gap-2">
            <div className="text-white w-70 h-full border-r border-r-neutral-600">
                <SideBar />
            </div>
            <div className="w-full max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                    <Link to="/profile" className="text-neutral-400 hover:text-white">←</Link>
                    <h1 className="text-xl font-semibold">{title}</h1>
                </div>

                {loading && <p className="text-neutral-500">Loading...</p>}
                {error && <p className="text-red-400">{error}</p>}

                {!loading && !error && (
                    users.length === 0 ? (
                        <p className="text-neutral-500 text-sm">No {title.toLowerCase()} yet.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {users.map((u) => (
                                <li
                                    key={u.id}
                                    className="border border-neutral-700 rounded-lg p-3"
                                >
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-sm text-neutral-500">@{u.username}</p>
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
}