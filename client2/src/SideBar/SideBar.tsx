import { HouseSimpleIcon, UserIcon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom"

export default function SideBar() {
    return (
        <div className="text-white flex flex-col text-lg items-center cursor-pointer p-3 gap-4">
            <NavLink
                to="/posts"
            >
                {({ isActive }) =>
                (
                    <div
                        className="flex items-center gap-3 hover:bg-neutral-800 px-4 py-2 rounded-full"
                    >
                        <HouseSimpleIcon weight={isActive ? "fill" : "regular"} />
                        <div className={isActive ? "font-semibold" : "font-normal"}>
                            Posts
                        </div>
                    </div>
                )
                }
            </NavLink>

            <NavLink
                to="/profile"
            >
                {({ isActive }) =>
                (
                    <div
                        className="flex items-center gap-3 hover:bg-neutral-800 px-4 py-2 rounded-full"
                    >
                        <UserIcon weight={isActive ? "fill" : "regular"} />
                        <div className={isActive ? "font-semibold" : "font-normal"}>
                            Profile
                        </div>
                    </div>
                )
                }
            </NavLink>
        </div>
    )
}