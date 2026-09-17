import AuthPage from "./Components/AuthPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/AuthPages/LogIn"
import Posts from "./Components/Posts";
import UserProfile from "./Components/UserProfile";
import FollowList from "./Components/Folllowers";


export default function App() {
  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center bg-black">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/following" element={<FollowList />} />
          <Route path="/followers" element={<FollowList />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}