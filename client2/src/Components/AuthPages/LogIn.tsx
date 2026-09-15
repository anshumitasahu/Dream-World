import { useState } from "react";
import axios from "axios";
import { Link, useNavigation } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";

const baseUrl = "http://localhost:3000"

export default function Login() {
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();

    const handleLogIn = async () => {
        console.log("clicked")
        const loginUrl = `${baseUrl}/auth/login`;

        const response = await axios.post(loginUrl, { email, password })
        console.log(response.data)
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
                    <button className="bg-black text-white p-2 rounded-4xl mt-4 w-full" onClick={handleLogIn}>
                        Log in
                    </button>
                </div>
                <div>
                    <img src="/si-4.png" alt="" className="rounded-4xl h-120 w-100 object-cover" />
                </div>
            </div>
        </div >
    )
}