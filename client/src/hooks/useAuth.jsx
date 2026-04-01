// hooks/useAuth.jsx
// React context that tracks whether a user is logged in.
// Wrap the whole app with <AuthProvider> and call useAuth() anywhere.

import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)  // true while checking token on page load

  // On app load, check if we have a stored token and if it's still valid
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    api.auth.me()
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))  // Token expired or invalid
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api.auth.login(email, password)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const register = async (email, password) => {
    const data = await api.auth.register(email, password)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
