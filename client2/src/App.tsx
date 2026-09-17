import AuthPage from "./Components/AuthPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/AuthPages/LogIn"
import Posts from "./Components/Posts";
import UserProfile from "./Components/UserProfile";


export default function App() {
  return (
    <div
      className="bg-[#001b33] w-screen h-screen flex flex-col items-center justify-center">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/user" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}