import React, { useContext, useEffect, useRef, useState } from 'react'
import { API_BASE_URL, UserContext } from '../App'
import Chart from 'chart.js/auto'

export default function GenreChart() {
  const { currentUser } = useContext(UserContext)
  const [msg, setMsg] = useState('')
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!currentUser) {
      setMsg('Please log in to see your genre chart.')
      return
    }
    const load = async () => {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.user_id}/genres`)
      const data = await res.json()
      if (chartRef.current) chartRef.current.destroy()
      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{ label: 'Movies per Genre', data: data.data }]
        },
        options: { scales: { y: { beginAtZero: true } } }
      })
    }
    load()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [currentUser])

  return (
    <div>
      <h2>Your Favorite Genres</h2>
      {msg && <p className="muted">{msg}</p>}
      <canvas ref={canvasRef} width="600" height="300" />
    </div>
  )
}
