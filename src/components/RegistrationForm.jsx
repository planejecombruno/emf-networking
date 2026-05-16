import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AREAS, ESTADOS_BR } from "../lib/constants";
import MultiSelect from "./MultiSelect";

const initialForm = {
  nome: "",
  cargo: "",
  email: "",
  sexo: "",
  data_nascimento: "",
  telefone: "",
  estado: "",
  cidade: "",
  linkedin_url: "",
  foto_url: "",
  sobre: "",
  area_atuacao: [],
  area_interesse: [],
  mostrar_telefone: true,
  mostrar_email: false,
};

export default function RegistrationForm({ onSuccess, user }) {
  const [form, setForm] = useState(initialForm);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, email: user.email }));
      fetchProfile();
    } else {
      setFetching(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfileId(data.id);
        setForm({
          nome: data.nome || "",
          cargo: data.cargo || "",
          email: data.email || user.email,
          sexo: data.sexo || "",
          data_nascimento: data.data_nascimento || "",
          telefone: data.telefone || "",
          estado: data.estado || "",
          cidade: data.cidade || "",
          linkedin_url: data.linkedin_url || "",
          foto_url: data.foto_url || "",
          sobre: data.sobre || "",
          area_atuacao: data.area_atuacao ? data.area_atuacao.split(", ") : [],
          area_interesse: data.area_interesse
            ? data.area_interesse.split(", ")
            : [],
          mostrar_telefone: data.mostrar_telefone !== false, // default true
          mostrar_email: data.mostrar_email === true, // default false
        });
      }
    } catch (err) {
      // Ignora erro se não encontrar perfil
    } finally {
      setFetching(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.nome.trim()) errs.nome = "Nome é obrigatório";
    if (!form.telefone.trim()) errs.telefone = "Telefone é obrigatório";
    if (!form.estado) errs.estado = "Estado é obrigatório";
    if (!form.cidade.trim()) errs.cidade = "Cidade é obrigatória";
    if (form.area_atuacao.length === 0)
      errs.area_atuacao = "Selecione ao menos uma área";
    if (form.linkedin_url && !/^https?:\/\/.+/.test(form.linkedin_url))
      errs.linkedin_url = "URL inválida";
    if (form.foto_url && !/^https?:\/\/.+/.test(form.foto_url))
      errs.foto_url = "URL inválida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        user_id: user.id,
        area_atuacao: form.area_atuacao.join(", "),
        area_interesse: form.area_interesse.join(", "),
      };

      // Supabase rejeita "" para campos do tipo data. Precisamos converter para null.
      if (!payload.data_nascimento) {
        payload.data_nascimento = null;
      }

      if (profileId) {
        payload.id = profileId;
      }

      const { error } = await supabase.from("profiles").upsert([payload]);
      if (error) throw error;
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrors({
        submit:
          "Erro ao salvar. Verifique se as permissões no banco estão corretas.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Carregando dados...
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <h2 className="form-card__section-title">Dados Pessoais</h2>

      <div className="field">
        <label className="field__label field__label--required">
          Nome completo
        </label>
        <input
          className="field__input"
          type="text"
          placeholder="Seu nome"
          value={form.nome}
          onChange={set("nome")}
        />
        {errors.nome && <p className="field__error">{errors.nome}</p>}
      </div>

      <div className="field">
        <label className="field__label">Cargo / Posição atual</label>
        <input
          className="field__input"
          type="text"
          placeholder="Ex: Analista de M&A, Sócio..."
          value={form.cargo}
          onChange={set("cargo")}
        />
      </div>

      <div className="field">
        <label className="field__label">E-mail</label>
        <input
          className="field__input"
          type="email"
          value={form.email}
          disabled
          style={{ background: "var(--border)", color: "var(--text-muted)", opacity: 0.6 }}
        />
        <p className="field__hint">Vinculado à sua conta</p>
      </div>

      <div className="field">
        <label className="field__label">Sexo</label>
        <div className="gender-options">
          {["Masculino", "Feminino"].map((g) => (
            <div
              key={g}
              className={`gender-option ${form.sexo === g ? "gender-option--active" : ""}`}
              onClick={() => setForm({ ...form, sexo: g })}
            >
              {g}
            </div>
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label">Data de nascimento</label>
          <input
            className="field__input"
            type="date"
            value={form.data_nascimento}
            onChange={set("data_nascimento")}
          />
        </div>
        <div className="field">
          <label className="field__label field__label--required">
            Telefone (WhatsApp)
          </label>
          <input
            className="field__input"
            type="tel"
            placeholder="(11) 99999-9999"
            value={form.telefone}
            onChange={set("telefone")}
          />
          {errors.telefone && <p className="field__error">{errors.telefone}</p>}
        </div>
      </div>

      <h2 className="form-card__section-title">Localização</h2>

      <div className="field-row">
        <div className="field">
          <label className="field__label field__label--required">
            Estado (UF)
          </label>
          <select
            className="field__select"
            value={form.estado}
            onChange={set("estado")}
          >
            <option value="">Selecione</option>
            {ESTADOS_BR.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          {errors.estado && <p className="field__error">{errors.estado}</p>}
        </div>
        <div className="field">
          <label className="field__label field__label--required">Cidade</label>
          <input
            className="field__input"
            type="text"
            placeholder="Sua cidade"
            value={form.cidade}
            onChange={set("cidade")}
          />
          {errors.cidade && <p className="field__error">{errors.cidade}</p>}
        </div>
      </div>

      <h2 className="form-card__section-title">Links</h2>

      <div className="field">
        <label className="field__label">LinkedIn</label>
        <input
          className="field__input"
          type="url"
          placeholder="https://linkedin.com/in/seuperfil"
          value={form.linkedin_url}
          onChange={set("linkedin_url")}
        />
        {errors.linkedin_url && (
          <p className="field__error">{errors.linkedin_url}</p>
        )}
      </div>

      <div className="field">
        <label className="field__label">URL da foto de perfil</label>
        <input
          className="field__input"
          type="url"
          placeholder="https://exemplo.com/foto.jpg"
          value={form.foto_url}
          onChange={set("foto_url")}
        />
        <p className="field__hint">
          Cole a URL de uma foto sua (LinkedIn, Gravatar, etc.)
        </p>
        {errors.foto_url && <p className="field__error">{errors.foto_url}</p>}
      </div>

      <h2 className="form-card__section-title">Sobre Você</h2>

      <div className="field">
        <label className="field__label">Bio</label>
        <textarea
          className="field__textarea"
          placeholder="Conte um pouco sobre sua experiência e objetivos..."
          value={form.sobre}
          onChange={set("sobre")}
          maxLength={300}
        />
        <p className="field__hint">{form.sobre.length}/300 caracteres</p>
      </div>

      <h2 className="form-card__section-title">Áreas</h2>

      <div className="field">
        <label className="field__label field__label--required">
          Área de atuação
        </label>
        <MultiSelect
          options={AREAS}
          selected={form.area_atuacao}
          onChange={(v) => setForm({ ...form, area_atuacao: v })}
          placeholder="Buscar ou selecionar atuação..."
        />
        {errors.area_atuacao && (
          <p className="field__error">{errors.area_atuacao}</p>
        )}
      </div>

      <div className="field">
        <label className="field__label">Área de interesse</label>
        <MultiSelect
          options={AREAS}
          selected={form.area_interesse}
          onChange={(v) => setForm({ ...form, area_interesse: v })}
          placeholder="Buscar ou selecionar interesse..."
        />
      </div>

      <h2 className="form-card__section-title">Privacidade e Visibilidade</h2>
      <div className="field">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={form.mostrar_telefone}
            onChange={(e) =>
              setForm({ ...form, mostrar_telefone: e.target.checked })
            }
          />
          Mostrar WhatsApp
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={form.mostrar_email}
            onChange={(e) =>
              setForm({ ...form, mostrar_email: e.target.checked })
            }
          />
          Mostrar E-mail
        </label>
      </div>

      {errors.submit && (
        <p
          className="field__error"
          style={{ textAlign: "center", marginTop: 12 }}
        >
          {errors.submit}
        </p>
      )}

      <button className="btn-submit" type="submit" disabled={loading}>
        {loading && <span className="btn-submit__spinner" />}
        {loading ? "Salvando..." : "Salvar Perfil"}
      </button>
    </form>
  );
}
