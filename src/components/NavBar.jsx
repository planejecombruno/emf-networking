import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { FaWhatsapp } from 'react-icons/fa'

export default function NavBar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isProfilePage = location.pathname === '/perfil'

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
      <Link to="/" className="header__logo" style={{ textDecoration: 'none' }}>
        EMF<span>Networking</span>
      </Link>
      
      <div className="nav-links" style={{ margin: 0, alignItems: 'center', gap: '20px' }}>
        <a 
          href="https://chat.whatsapp.com/J0MCE7hJJo6Cu8NBkxa9fi" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-link nav-link--whatsapp"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FaWhatsapp size={18} />
          <span>Comunidade</span>
        </a>

        {user ? (
          <>
            {isProfilePage ? (
              <Link to="/diretorio" className="nav-link" style={{ fontWeight: 600 }}>Profissionais</Link>
            ) : (
              <Link to="/perfil" className="nav-link" style={{ fontWeight: 600 }}>Meu Perfil</Link>
            )}
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sair</button>
          </>
        ) : (
          <Link to="/auth" className="nav-link" style={{ background: 'var(--accent)', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}>Entrar / Criar Conta</Link>
        )}
      </div>
    </header>
  )
}
