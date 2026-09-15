import { NavLink } from "react-router-dom"
import SignIn from "./AuthPages/SignIn"
export default function AuthPage() {
    return (
        <div className="flex gap-3 w-fit h-fit bg-white p-2 rounded-4xl">
            <div>
                <img src="/si-3.jpg" alt="" className="rounded-4xl h-120 w-100 object-cover" />
            </div>
            <div className="w-100 h-fit p-5">
                <SignIn />
                <div className="px-5 text-neutral-600 text-sm">
                    Already had an account?
                </div>
                <ul>
                    <li className="px-5 text-neutral-600 text-sm underline">
                        <NavLink to="/login">
                            Login
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    )
}