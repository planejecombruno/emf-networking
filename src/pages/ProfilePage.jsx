import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import RegistrationForm from '../components/RegistrationForm'
import ChangePasswordForm from '../components/ChangePasswordForm'
import NavBar from '../components/NavBar'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  if (loading || !user) return <div className="page-wrapper" style={{ justifyContent: 'center' }}><div className="btn-submit__spinner" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent', width: 40, height: 40 }}></div></div>

  return (
    <div className="page-wrapper">
      <NavBar />
      <div className="hero" style={{ padding: '20px 0' }}>
        <h1 className="hero__title" style={{ fontSize: '1.5rem' }}>Meu Perfil</h1>
        <p className="hero__desc" style={{ fontSize: '0.85rem' }}>Atualize suas informações para aparecer no diretório.</p>
      </div>
      <RegistrationForm onSuccess={() => navigate('/diretorio')} user={user} />
      <ChangePasswordForm user={user} />
    </div>
  )
}
