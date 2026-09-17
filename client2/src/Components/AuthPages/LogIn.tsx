import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";

const baseUrl = "http://localhost:3000"

export default function Login() {
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [error, setError] = useState<string>();
    const navigate = useNavigate();

    const handleLogIn = async () => {
        console.log("clicked")
        try {
            const loginUrl = `${baseUrl}/auth/login`;

            const response = await axios.post(loginUrl, { email, password }, { withCredentials: true })
            console.log(response.data);

            navigate("/posts");
        } catch (error) {
            console.error(error);
            setError('Invalid email or password');
        }

    }

    return (
        <div className="bg-[#e28476] w-screen h-screen flex justify-center items-center">
            <div className="flex gap-3 w-fit h-fit bg-white p-2 rounded-4xl">
                <div className="p-10 w-100">
                    <Link to="/">
                        <div className="w-fit p-2 mb-4 bg-gray-100 rounded-full">
                            <ArrowLeftIcon />
                        </div>
                    </Link>
                    <div className="w-full">
                        <h1 className="text-left text-3xl text-neutral-700 mb-4">Log in</h1>
                        <div className="mb-2">
                            <div className="text-sm text-neutral-600 ">Email Address</div>
                            <input
                                type="text"
                                className="border border-neutral-500  w-full rounded-4xl px-4 py-2 outline-0 text-xs"
                                placeholder="JhonSmith@gmail.com"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <div className="text-sm text-neutral-600">Password</div>
                            <input
                                type="password"
                                className="border border-neutral-500 w-full rounded-4xl px-4 py-2 outline-0 text-xs"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 text-neutral-600 text-xs py-3">
                            <input type="checkbox" name="tearms and condition" className="outline-0" />
                            I agree with the terms and condition
                        </div>
                    </div>
                    <button className="bg-black text-white p-2 rounded-4xl mt-4 w-full cursor-pointer" onClick={handleLogIn}>
                        Log in
                    </button>
                    {error && <div className="text-red-500 text-xs">{error}</div>}

                    <div className="mt-10 text-center text-xl">
                        Welcome Back!
                    </div>
                </div>
                <div>
                    <img src="/si-4.png" alt="" className="rounded-4xl h-130 w-100 object-cover" />
                </div>
            </div>
        </div >
    )
}