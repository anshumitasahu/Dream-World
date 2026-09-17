import AuthPage from "./Components/AuthPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/AuthPages/LogIn"
import Posts from "./Components/Posts";
import UserProfile from "./Components/UserProfile";


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
        </Routes>
      </BrowserRouter>
    </div>
  )
}