import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import SuccessPage from './pages/SuccessPage'
import DirectoryPage from './pages/DirectoryPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/sucesso" element={<SuccessPage />} />
        <Route path="/diretorio" element={<DirectoryPage />} />
      </Routes>
      <footer className="footer">
        © {new Date().getFullYear()} EMF Networking. Todos os direitos reservados.
      </footer>
    </AuthProvider>
  )
}

export default App
