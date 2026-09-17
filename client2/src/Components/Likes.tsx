import { useState } from "react";
import { HeartIcon } from "@phosphor-icons/react";

type Props = {
    postId: string;
    initialLiked: boolean;
    initialCount: number;
};

export default function Likes({ postId, initialLiked, initialCount }: Props) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [pending, setPending] = useState(false);

    const handleLikeToggle = async () => {
        if (pending) return;
        const next = !isLiked;

        setIsLiked(next);
        setCount(c => c + (next ? 1 : -1));
        setPending(true);

        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}/likes`, {
                method: next ? "POST" : "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error();
        } catch {
            setIsLiked(!next);
            setCount(c => c + (next ? -1 : 1));
        } finally {
            setPending(false);
        }
    };

    return (
        <button onClick={handleLikeToggle} disabled={pending} className="cursor-pointer flex items-center gap-1 hover:text-red-200">
            <HeartIcon weight={isLiked ? "fill" : "regular"} />
            <span>{count}</span>
        </button>
    );
}