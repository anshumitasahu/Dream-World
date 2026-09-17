import { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

interface UserSummary {
    id: string;
    name: string;
    username: string;
}

interface PostSummary {
    id: string;
    content: string;
    createdAt: string;
}

interface UserProfileData {
    id: string;
    name: string;
    username: string;
    bio: string | null;
    profilePicture: string | null;
    coverPicture: string | null;
    posts: PostSummary[];
    following: { following: UserSummary }[];
    follower: { follower: UserSummary }[];
    _count: {
        follower: number;
        following: number;
    };
}

const baseUrl = "http://localhost:3000"

export default function UserProfile() {
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        bio: "",
        profilePicture: "",
        coverPicture: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/user/profile`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch profile (${res.status})`);
            }

            const json = await res.json();
            const data: UserProfileData = json.data;

            setProfile(data);
            setForm({
                name: data.name ?? "",
                bio: data.bio ?? "",
                profilePicture: data.profilePicture ?? "",
                coverPicture: data.coverPicture ?? "",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${baseUrl}/user/profile`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error(`Failed to update profile (${res.status})`);
            }

            const json = await res.json();
            setProfile((prev) => (prev ? { ...prev, ...json.data } : prev));
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!profile) return;
        setForm({
            name: profile.name ?? "",
            bio: profile.bio ?? "",
            profilePicture: profile.profilePicture ?? "",
            coverPicture: profile.coverPicture ?? "",
        });
        setIsEditing(false);
    };

    if (loading) {
        return <div className="profile-status">Loading profile...</div>;
    }

    if (error) {
        return (
            <div className="profile-status profile-error">
                <p>{error}</p>
                <button onClick={fetchProfile}>Retry</button>
            </div>
        );
    }

    if (!profile) {
        return <div className="profile-status">No profile found.</div>;
    }

    return (
        <div className="bg-black text-white w-screen h-screen p-2 overflow-scroll flex gap-2">
            <div className="text-white w-70 h-full border-r border-r-neutral-600">
                <SideBar />
            </div>
            <div className="w-full">
                <div
                    className="w-full h-60 relative"
                >
                    <img
                        src={profile.coverPicture || "/banner.jpg"}
                        className="w-full h-60 object-cover"
                    />
                    <img
                        className="w-35 rounded-full z-10 absolute bottom-0 left-6 translate-y-1/2 object cover border-6 border-black"
                        src={profile.profilePicture || "/user.jpg"}
                        alt={`${profile.name}'s avatar`}
                    />

                    <div className="w-full text-right mt-3">
                        <button onClick={() => setIsEditing(true)} className="border border-neutral-500 px-4 py-1.5 rounded-full mr-5 cursor-pointer">Edit Profile</button>
                    </div>
                </div>

                <div className="w-full mt-20">
                    {!isEditing ? (
                        <>
                            <h1 className="text-xl font-semibold">{profile.name}</h1>
                            <p className="text-sm text-neutral-500">{profile.username}</p>
                            {profile.bio && <p className="mt-5">{profile.bio}</p>}

                            <div className="flex gap-6 mt-2">
                                <div>
                                    <NavLink to="/following" className="font-bold">{profile._count.following} <span className="text-neutral-500 font-normal text-sm">Following</span></NavLink>
                                </div>
                                <div>
                                    <NavLink to="/followers" className="font-bold">{profile._count.follower} <span className="text-neutral-500 font-normal text-sm">Followers</span></NavLink>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 border border-neutral-600 rounded-lg p-3 ">
                            <div className=" flex gap-3 items-center px-2">
                                <div>
                                    Name:
                                </div>
                                <input
                                    name="name"
                                    className="outline-0 border border-neutral-600 rounded-full px-3 py-1 hover:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-200"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className=" flex gap-3 items-center px-2">
                                <div>
                                    Bio:
                                </div>
                                <textarea
                                    name="bio"
                                    className="outline-0 border border-neutral-600 rounded-xl px-3 py-1 hover:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-200 resize-none"
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <div className=" flex gap-3 items-center px-2">
                                <div>
                                    Profile Picture URL:
                                </div>
                                <input
                                    name="profilePicture"
                                    className="outline-0 border border-neutral-600 rounded-xl px-3 py-1 hover:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-200 resize-none"
                                    value={form.profilePicture}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className=" flex gap-3 items-center px-2">
                                <div>
                                    Cover Picture URL:
                                </div>
                                <input
                                    name="coverPicture"
                                    className="outline-0 border border-neutral-600 rounded-xl px-3 py-1 hover:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-200 resize-none"
                                    value={form.coverPicture}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex gap-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="border border-neutral-500 px-4 py-1.5 rounded-full mr-5 cursor-pointer hover:border-amber-200"
                                >
                                    {saving ? <SpinnerGapIcon /> : "Save"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="border border-neutral-500 px-4 py-1.5 rounded-full mr-5 cursor-pointer hover:bg-amber-200 hover:text-black"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Posts</h3>
                        {profile.posts.length === 0 ? (
                            <p className="text-neutral-500 text-sm">No posts yet.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {profile.posts.map((post) => (
                                    <li
                                        key={post.id}
                                        className="border border-neutral-700 rounded-lg p-3"
                                    >
                                        <p>{post.content}</p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}