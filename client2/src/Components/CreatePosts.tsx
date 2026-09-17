import { useState } from "react";
import axios from "axios";
import { PlusCircleIcon, SpinnerGapIcon } from "@phosphor-icons/react";

axios.defaults.withCredentials = true;

const baseUrl = "http://localhost:3000";

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    const handlePost = async () => {
        if (!content?.trim()) return;

        setLoading(true);
        setError('');

        try {
            await axios.post(`${baseUrl}/posts`, { content }, { withCredentials: true })
            setContent("");
            onPostCreated?.()
        } catch (error) {
            console.error(error)
            setError("Could not create post");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full rounded-2xl p-4 shadow flex flex-col gap-2 border border-neutral-600 mb-8">
            <textarea
                className="w-full h-30 rounded-2xl p-4 text-sm resize-none outline-0"
                rows={3}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            {error && <div className="text-red-500 text-xs">{error}</div>}
            <button
                className="bg-black text-neutral-400 text-sm rounded-4xl py-2 self-end px-6 disabled:opacity-50 hover:text-white"
                onClick={handlePost}
                disabled={loading}
            >
                {loading ? <SpinnerGapIcon size={28} className="cursor-progress" /> : <PlusCircleIcon size={28} className="cursor-pointer" />}
            </button>
        </div>
    )
}