import React, { useContext, useState } from 'react'
import { API_BASE_URL, UserContext } from '../config.js'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useContext(UserContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async () => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.user_id) {
      login(data)
      nav('/movies')
    } else {
      setMsg(data.error || 'Login failed')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <div className="inputs">
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={submit}>Login</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </div>
  )
}
