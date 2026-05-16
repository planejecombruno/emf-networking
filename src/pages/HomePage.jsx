import { Link, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ justifyContent: "center" }}>
        <div
          className="btn-submit__spinner"
          style={{
            borderColor: "var(--accent)",
            borderTopColor: "transparent",
            width: 40,
            height: 40,
          }}
        ></div>
      </div>
    );
  }

  // Se já estiver logado, redireciona direto para o diretório
  if (user) {
    return <Navigate to="/diretorio" replace />;
  }

  return (
    <div className="page-wrapper">
      <NavBar />
      <main className="hero" style={{ marginTop: "40px" }}>
        <h1 className="hero__title">
          Conecte-se com profissionais do <span>Mercado Financeiro</span>
        </h1>
        <p className="hero__desc" style={{ marginBottom: "32px" }}>
          Faça parte do diretório exclusivo de profissionais de Investment
          Banking, Private Equity, Wealth Management e muito mais.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link
            to="/auth"
            className="btn-submit"
            style={{
              display: "inline-block",
              width: "auto",
              padding: "14px 28px",
              textDecoration: "none",
            }}
          >
            Fazer Login / Cadastrar
          </Link>
        </div>
      </main>
    </div>
  );
}
