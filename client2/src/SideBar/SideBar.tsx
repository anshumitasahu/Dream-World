import { useNavigate } from "react-router-dom"

export default function SideBar() {
    const navigate = useNavigate()

    const handlePost = () => {
        navigate("/posts");
    }

    const handleUserProfile = () => {
        navigate("/user")
    }

    return (
        <div className="text-white border-r border-r-neutral-500">
            <ul>
                <li onClick={handlePost}>
                    post
                </li>
                <li onClick={handleUserProfile}>
                    User
                </li>
            </ul>
        </div>
    )
}