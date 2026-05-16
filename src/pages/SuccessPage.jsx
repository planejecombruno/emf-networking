import { useNavigate } from 'react-router-dom'

export default function SuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="success-page">
      <div className="success-icon">✓</div>
      <h1>Cadastro realizado!</h1>
      <p>Suas informações foram adicionadas ao nosso diretório com sucesso.</p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn-back" onClick={() => navigate('/')}>
          Voltar ao Início
        </button>
        <button className="btn-submit" style={{ marginTop: '32px' }} onClick={() => navigate('/diretorio')}>
          Ver Diretório
        </button>
      </div>
    </div>
  )
}
