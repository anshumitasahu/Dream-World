import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseUrl = "http://localhost:3000"

export default function SignIn() {
    const [name, setName] = useState<string>();
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [error, setError] = useState<string>();
    const navigate = useNavigate();

    const handleSignIn = async () => {
        console.log("clicked")
        try {
            const signUpUrl = `${baseUrl}/auth/register`;

            const response = await axios.post(signUpUrl, { name, email, password, username }, { withCredentials: true });
            console.log(response.data);

            navigate('/posts');
        } catch (error) {
            setError("Could not create account");
        }
    }

    return (
        <div className="bg-white w-full h-fit flex flex-col p-6 gap-2">

            <h1 className="text-left text-3xl text-neutral-700">Create an Account</h1>
            <div className="flex flex-col gap-3">
                <div>
                    <div className="text-sm text-neutral-600">Name</div>
                    <input
                        type="text"
                        className="border border-neutral-500  w-full rounded-4xl px-4 py-2 outline-0 text-xs"
                        placeholder="John Smith"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <div className="text-sm text-neutral-600">User Name</div>
                    <input
                        type="text"
                        className="border border-neutral-500  w-full rounded-4xl px-4 py-2 outline-0 text-xs"
                        placeholder="@jhonsmith"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <div className="text-sm text-neutral-600">Email Address</div>
                    <input
                        type="text"
                        className="border border-neutral-500  w-full rounded-4xl px-4 py-2 outline-0 text-xs"
                        placeholder="JhonSmith@gmail.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <div className="text-sm text-neutral-600">Password</div>
                    <input
                        type="text"
                        className="border border-neutral-500 w-full rounded-4xl px-4 py-2 outline-0 text-xs"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-2 text-neutral-600 text-xs py-3">
                <input type="checkbox" name="tearms and condition" className="outline-0" required />
                I agree with the terms and condition
            </div>

            <button className="bg-black text-white p-2 rounded-4xl cursor-pointer" onClick={handleSignIn}>
                Create Account
            </button>
        </div>
    )
}