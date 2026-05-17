import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ChangePasswordForm({ user }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Se o usuário logou com Google ou outro provedor OAuth, não exibimos alteração de senha
  if (!user || user.app_metadata?.provider !== "email") {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("As novas senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verifica se a senha atual está correta tentando autenticar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("A senha atual está incorreta.");
        setLoading(false);
        return;
      }

      // 2. Atualiza para a nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Erro ao alterar senha. Verifique os dados e tente novamente.");
      console.error("Erro ao atualizar senha:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" style={{ marginTop: "32px", marginBottom: "40px" }}>
      <h2 className="form-card__section-title" style={{ marginTop: 0 }}>
        Alterar Senha de Acesso
      </h2>

      {success && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--success-bg)",
            color: "var(--success)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          ✓ Senha alterada com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label field__label--required">
            Senha Atual
          </label>
          <input
            className="field__input"
            type="password"
            placeholder="Sua senha atual"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field__label field__label--required">
              Nova Senha
            </label>
            <input
              className="field__input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label field__label--required">
              Repetir Nova Senha
            </label>
            <input
              className="field__input"
              type="password"
              placeholder="Confirme a nova senha"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="field__error" style={{ marginBottom: 12 }}>{error}</p>}

        <button
          className="btn-submit"
          type="submit"
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          style={{ marginTop: 12 }}
        >
          {loading && <span className="btn-submit__spinner" />}
          {loading ? "Atualizando..." : "Atualizar Senha"}
        </button>
      </form>
    </div>
  );
}
