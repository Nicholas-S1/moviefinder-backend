import React, { useState } from 'react'
import { API_BASE_URL } from '../config.js'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async () => {
    const res = await fetch(`${API_BASE_URL}/signup`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ full_name: username, username, password })
    })
    const data = await res.json()
    if (data.user_id) {
      setMsg('Signup successful! You can log in now.')
      setTimeout(()=> nav('/login'), 800)
    } else {
      setMsg(data.error || 'Signup failed')
    }
  }

  return (
    <div>
      <h2>Signup</h2>
      <div className="inputs">
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={submit}>Create Account</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </div>
  )
}
