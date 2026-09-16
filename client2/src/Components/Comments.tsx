import { ArrowLeftIcon, ChatCircleIcon } from "@phosphor-icons/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const baseUrl = "http://localhost:4000";

interface CommentAuthor {
    id: string;
    name: string;
}

interface Comment {
    id: string;
    content: string;
    user: CommentAuthor
}

interface CommentsProps {
    postId: string
}

export default function Comments({ postId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("");
    const [newComment, setNewComment] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [commentsDisplayed, setCommentsDisplayed] = useState<boolean>(false)

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${baseUrl}/posts/${postId}/comments`);
            if (response.data?.success) {
                setComments(response.data.data);
            } else {
                setError("Could not load comments")
            }
        } catch (error) {
            console.error(error);
            setError("Something went wrong fetching comments :(")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await axios.post(`${baseUrl}/posts/${postId}/comments`, {
                content: newComment,
            });
            if (response.data?.success) {
                setNewComment("");
                fetchComments();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentToggle = () => {
        setCommentsDisplayed(prev => !prev);
    }

    if (loading) return <div className="text-neutral-500 text-sm">loading comments...</div>;
    if (error) return <div className="text-red-500 text-sm">{error}</div>;

    return (
        <div>
            {commentsDisplayed ?
                <button
                    onClick={handleCommentToggle} className="cursor-pointer"
                >
                    <ArrowLeftIcon />
                </button>
                :
                <button
                    onClick={handleCommentToggle}
                    className="cursor-pointer"
                >
                    <ChatCircleIcon />
                </button>
            }

            {commentsDisplayed && (
                <div>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1 text-sm text-white outline-none mb-3"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="text-sm px-3 py-1 rounded-lg bg-neutral-800 text-white disabled:opacity-50"
                        >
                            {submitting ? "..." : "Post"}
                        </button>
                    </form>

                    <div className="flex flex-col gap-2">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2 text-sm">
                                <span className="text-white">{comment.user.name}</span>
                                <span className="text-neutral-400">{comment.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}