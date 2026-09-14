import axios from "axios";
import { useState } from "react"

const baseUrl = "http://localhost:3000"

export default function App() {
  return (
    <div>
      <Logout />
    </div>
  )
}

function SignUp() {
  const [emailInput, setEmailInput] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [name, setname] = useState<string>();

  const handleSignUP = async () => {
    const signupUrl = `${baseUrl}/auth/register`;

    const res = await axios.post(signupUrl, { email: emailInput, password, name })
    console.log(res.data);
  }

  return (
    <div>
      <h1>Signup</h1>
      <input type="text" onChange={(e) => setname(e.target.value)} />
      <input type="email" onChange={(e) => setEmailInput(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleSignUP}>signup</button>
    </div>
  )
}

function Login() {
  const [emailInput, setEmailInput] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handelLogin = async () => {
    const loginUrl = `${baseUrl}/auth/login`;

    const res = await axios.post(loginUrl, { email: emailInput, password })
    console.log(res.data);
  }

  return (
    <div>
      <h1>login</h1>
      <input type="email" onChange={(e) => setEmailInput(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handelLogin}>login</button>
    </div>
  )
}

function Logout() {
  const [emailInput, setEmailInput] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handleLogout = async () => {
    const logoutUrl = `${baseUrl}/auth/logout`;

    const res = await axios.post(logoutUrl, { email: emailInput, password })
    console.log(res.data);
  }

  return (
    <div>
      <h1>Logout</h1>
      <input type="email" onChange={(e) => setEmailInput(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleLogout}>logout</button>
    </div>
  )
}