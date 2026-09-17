import axios from "axios";
import { useEffect, useState } from "react";
import CreatePost from "./CreatePosts";
import Comments from "./Comments";
import Likes from "./Likes";
import Follow from "./Follow";
import SideBar from "../SideBar/SideBar";

const baseUrl = "http://localhost:3000";

interface Author {
    id: string;
    name: string;
}

interface Post {
    id: string;
    content: string;
    createdAt: string;
    author: Author;
    _count: {
        likes: number;
    };
    likes: {
        id: string;
    }[];
}

export default function Posts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${baseUrl}/posts`);
            if (response.data?.success) {
                setPosts(response.data.data);
            } else {
                setError("Could not load posts");
            };
        } catch (error) {
            console.error(error);
            setError("Something went wrong fetching posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return <div className="text-white">loading...</div>
    if (error) return <div className="text-red-500">{error}</div>

    return (
        <div className="bg-black w-screen h-screen p-2 overflow-scroll flex">
            <div className="text-white">
                <SideBar />
            </div>

            <div className="text-white">
                <div className="w-full">
                    <CreatePost onPostCreated={fetchPosts} />
                </div>
                <div className="flex flex-col gap-5">
                    {posts.map((post) => (
                        <div key={post.id} className="border border-neutral-800 p-3 rounded-xl flex flex-col gap-5">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    <img src="/si-1.jpg" className="w-12 rounded-full" />
                                    <div>
                                        <div className="text-white text-md">
                                            {post.author.name}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {post.author.id}
                                        </div>
                                    </div>
                                </div>
                                <Follow userId={post.author.id} />
                            </div>
                            <div>
                                {post.content}
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <Likes postId={post.id}
                                        initialLiked={post.likes.length > 0}
                                        initialCount={post._count.likes} />
                                </div>
                                <div>
                                    <Comments postId={post.id} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    )
}