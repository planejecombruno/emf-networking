import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const checkProfileAndNavigate = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nome, telefone, area_atuacao')
        .eq('user_id', userId)
        .single()
      
      if (!error && data && data.nome && data.telefone && data.area_atuacao) {
        navigate('/diretorio')
      } else {
        navigate('/perfil')
      }
    } catch (err) {
      navigate('/perfil')
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    try {
      let authUser = null
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        authUser = data.user
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        authUser = data.user
      }
      
      if (authUser) {
        await checkProfileAndNavigate(authUser.id)
      }
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.')
      } else if (err.message.includes('User already registered')) {
        setError('Este e-mail já está cadastrado.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <NavBar />
      <div className="form-card" style={{ maxWidth: '400px', margin: '40px auto 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
        </h2>

        <form onSubmit={handleAuth}>
          <div className="field">
            <label className="field__label">E-mail</label>
            <input type="email" required className="field__input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Senha</label>
            <input type="password" required className="field__input" value={password} onChange={e => setPassword(e.target.value)} />
            {!isLogin && <p className="field__hint">Mínimo de 6 caracteres</p>}
          </div>

          {!isLogin && (
            <div className="field">
              <label className="field__label">Confirmar Senha</label>
              <input 
                type="password" 
                required 
                className="field__input" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
            </div>
          )}
          
          {error && <p className="field__error" style={{ marginBottom: '12px' }}>{error}</p>}
          
          <button type="submit" disabled={loading} className="btn-submit" style={{ marginTop: '8px' }}>
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </div>
      </div>
    </div>
  )
}
