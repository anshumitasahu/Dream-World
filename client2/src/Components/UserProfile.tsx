import { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";

interface UserSummary {
    id: string;
    name: string;
    username: string;
}

interface UserProfileData {
    id: string;
    name: string;
    username: string;
    bio: string | null;
    profilePicture: string | null;
    coverPicture: string | null;
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

    // Edit mode state
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
        <div className="profile-container text-white">
            <div>
                <SideBar />
            </div>
            <div
                className="profile-cover"
                style={{
                    backgroundImage: profile.coverPicture
                        ? `url(${profile.coverPicture})`
                        : undefined,
                }}
            >
                <img
                    className="profile-avatar"
                    src={profile.profilePicture || "/default-avatar.png"}
                    alt={`${profile.name}'s avatar`}
                />
            </div>

            <div className="profile-body">
                {!isEditing ? (
                    <>
                        <h1>{profile.name}</h1>
                        <p className="profile-username">@{profile.username}</p>
                        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

                        <div className="profile-counts">
                            <span>
                                <strong>{profile._count.following}</strong> Following
                            </span>
                            <span>
                                <strong>{profile._count.follower}</strong> Followers
                            </span>
                        </div>

                        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                    </>
                ) : (
                    <div className="profile-edit-form">
                        <label>
                            Name
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Bio
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                rows={3}
                            />
                        </label>

                        <label>
                            Profile Picture URL
                            <input
                                name="profilePicture"
                                value={form.profilePicture}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Cover Picture URL
                            <input
                                name="coverPicture"
                                value={form.coverPicture}
                                onChange={handleChange}
                            />
                        </label>

                        <div className="profile-edit-actions">
                            <button onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button onClick={handleCancel} disabled={saving}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="profile-lists">
                    <div>
                        <h3>Following</h3>
                        <ul>
                            {profile.following.map(({ following }) => (
                                <li key={following.id}>
                                    {following.name} (@{following.username})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3>Followers</h3>
                        <ul>
                            {profile.follower.map(({ follower }) => (
                                <li key={follower.id}>
                                    {follower.name} (@{follower.username})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}