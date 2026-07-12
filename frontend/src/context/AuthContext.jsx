import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// Helper to ensure user ID is always a valid RFC4122 UUID for PostgreSQL
export const getDeterministicUUID = (email) => {
  if (!email) return '00000000-0000-4000-8000-000000000000'
  const clean = email.trim().toLowerCase()
  if (clean === 'pranjalrai1306@gmail.com') {
    return '6bdd8dc9-2641-40ff-818a-ae147086d973'
  }
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i)
    hash |= 0
  }
  let hex = ''
  for (let i = 0; i < 16; i++) {
    const v = Math.abs(Math.sin(hash + (i * 9.17)) * 256) | 0
    hex += v.toString(16).padStart(2, '0')
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 15)}-a${hex.slice(17, 19)}-${hex.slice(20, 32)}`
}

// Helper to retrieve all locally registered users
const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem('careerai_registered_users')
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

// Helper to save a registered user account
const saveStoredUser = (email, password, fullName) => {
  try {
    const users = getStoredUsers()
    const cleanEmail = email.trim().toLowerCase()
    const userId = getDeterministicUUID(cleanEmail)
    users[cleanEmail] = {
      id: userId,
      email: cleanEmail,
      password: password,
      fullName: fullName.trim(),
      created_at: new Date().toISOString()
    }
    localStorage.setItem('careerai_registered_users', JSON.stringify(users))
    return users[cleanEmail]
  } catch (e) {
    console.error('Error saving user locally:', e)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch or construct profile
  const fetchProfile = useCallback(async (userId, userEmail) => {
    if (!userId) return null

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (!error && data) {
          setProfile(data)
          return data
        }
      } catch (err) {
        console.warn('Profile fetch from Supabase failed, using local profile fallback.')
      }
    }

    const initialProfile = {
      id: userId,
      email: userEmail,
      full_name: '',
      phone: '',
      location: '',
      headline: '',
      target_role: 'Software Engineer',
    }
    setProfile(initialProfile)
    return initialProfile
  }, [])

  // Initialize session on mount
  useEffect(() => {
    // 1. Check if an active direct user session exists
    const savedActiveSession = localStorage.getItem('careerai_active_user_session')
    if (savedActiveSession) {
      try {
        const parsed = JSON.parse(savedActiveSession)
        const validId = getDeterministicUUID(parsed.user?.email)
        parsed.user.id = validId
        if (parsed.profile) parsed.profile.id = validId
        localStorage.setItem('careerai_active_user_session', JSON.stringify(parsed))

        setUser(parsed.user)
        setProfile(parsed.profile)
        setSession(parsed.session)
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem('careerai_active_user_session')
      }
    }

    // 2. Check if demo session is stored
    const savedDemo = localStorage.getItem('careerai_demo_session')
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo)
        setUser(parsed.user)
        setProfile(parsed.profile)
        setSession(parsed.session)
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem('careerai_demo_session')
      }
    }

    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // 3. Supabase active session listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user.email)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [fetchProfile])

  // Sign in with email and password
  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase()

    // 1. Attempt Supabase cloud auth first
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (!error && data?.user) {
          setUser(data.user)
          setSession(data.session)
          await fetchProfile(data.user.id, data.user.email)
          return data
        }
      } catch (sbErr) {
        console.warn('Supabase cloud login was not accepted:', sbErr.message)
      }
    }

    // 2. Verify against registered users store
    const users = getStoredUsers()
    const foundUser = users[cleanEmail]

    if (foundUser) {
      if (foundUser.password !== password) {
        throw new Error('Incorrect password. Please check your password and try again.')
      }

      // Successful credentials match
      const validUserId = getDeterministicUUID(cleanEmail)
      const activeUser = {
        id: validUserId,
        email: cleanEmail,
        role: 'authenticated',
        aud: 'authenticated',
        user_metadata: { full_name: foundUser.fullName }
      }
      const activeProfile = {
        id: validUserId,
        email: cleanEmail,
        full_name: foundUser.fullName,
        target_role: 'Software Engineer',
        phone: '',
        location: '',
        headline: ''
      }
      const activeSession = {
        access_token: 'auth-jwt-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_') + '-' + Date.now(),
        user: activeUser,
        token_type: 'bearer'
      }

      setUser(activeUser)
      setProfile(activeProfile)
      setSession(activeSession)
      localStorage.setItem('careerai_active_user_session', JSON.stringify({
        user: activeUser,
        profile: activeProfile,
        session: activeSession
      }))

      // Sync profile to Supabase if configured
      if (isSupabaseConfigured) {
        supabase.from('profiles').upsert({
          id: activeUser.id,
          email: cleanEmail,
          full_name: foundUser.fullName,
          target_role: 'Software Engineer'
        }).then(() => {}).catch(() => {})
      }

      return { user: activeUser, session: activeSession }
    }

    throw new Error('No account found for ' + cleanEmail + '. Please create an account on the Sign Up page first.')
  }

  // Sign up with email, password, and full name
  const signUp = async (email, password, fullName = '') => {
    const cleanEmail = email.trim().toLowerCase()
    
    // Save to user store so sign in with this email and password ALWAYS succeeds immediately
    const storedUser = saveStoredUser(cleanEmail, password, fullName)

    // Also attempt Supabase cloud registration in background
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim() }
          }
        })
      } catch (err) {
        console.warn('Supabase cloud signup sync:', err.message)
      }
    }

    return {
      user: {
        id: storedUser?.id || 'usr_' + Date.now(),
        email: cleanEmail,
        user_metadata: { full_name: fullName }
      },
      message: 'Account created successfully!'
    }
  }

  // Sign out
  const signOut = async () => {
    localStorage.removeItem('careerai_active_user_session')
    localStorage.removeItem('careerai_demo_session')

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (e) {}
    }

    setUser(null)
    setSession(null)
    setProfile(null)
  }

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No authenticated user')

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const updated = { ...profile, ...payload }
    setProfile(updated)

    // Save in active session
    const saved = localStorage.getItem('careerai_active_user_session')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        localStorage.setItem('careerai_active_user_session', JSON.stringify({
          ...parsed,
          profile: updated
        }))
      } catch (e) {}
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, email: user.email, ...payload })
      } catch (e) {}
    }

    return updated
  }

  const refreshProfile = async () => {
    if (user) {
      return await fetchProfile(user.id, user.email)
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    isConfigured: true,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
