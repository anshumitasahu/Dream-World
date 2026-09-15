import { useState } from "react";
import axios from "axios";


const baseUrl = "http://localhost:3000"

export default function SignIn() {
    const [name, setName] = useState<string>();
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();

    const handleSignIn = async () => {
        console.log("clicked")
        const signUpUrl = `${baseUrl}/auth/register`;

        const response = await axios.post(signUpUrl, { name, email, password })
        console.log(response.data)
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
                <input type="checkbox" name="tearms and condition" className="outline-0" />
                I agree with the terms and condition
            </div>

            <button className="bg-black text-white p-2 rounded-4xl" onClick={handleSignIn}>
                Create Account
            </button>
        </div>
    )
}