import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { FaWhatsapp, FaMoon, FaSun } from "react-icons/fa";

export default function NavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isProfilePage = location.pathname === "/perfil";

  return (
    <header className="header">
      <Link to="/" className="header__logo" style={{ textDecoration: "none" }}>
        EMF<span>Networking</span>
      </Link>

      <div className="nav-links">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>

        {user ? (
          <>
            <a
              href="https://chat.whatsapp.com/J0MCE7hJJo6Cu8NBkxa9fi"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link nav-link--whatsapp"
            >
              <FaWhatsapp size={18} />
              <span>Comunidade</span>
            </a>
            {isProfilePage ? (
              <Link
                to="/diretorio"
                className="nav-link"
                style={{ fontWeight: 600 }}
              >
                Profissionais
              </Link>
            ) : (
              <Link
                to="/perfil"
                className="nav-link"
                style={{ fontWeight: 600 }}
              >
                Meu Perfil
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="nav-link"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "4px",
            }}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
