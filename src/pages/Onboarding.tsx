import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAppStore } from '../store/useAppStore'

export const Onboarding: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const { setAuthenticated, setUser } = useAppStore()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock authentication
    setAuthenticated(true)
    setUser({
      name: name || 'User',
      email: email || 'user@example.com',
    })
    navigate('/')
  }
  
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-netflix-black px-4 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-netflix-red mb-2">DarkCase</h1>
          <p className="text-netflix-lightGray">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" fullWidth size="lg">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-netflix-lightGray hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthenticated(true)
              setUser({ name: 'Guest', email: 'guest@example.com' })
              navigate('/')
            }}
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  )
}

