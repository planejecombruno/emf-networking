import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AREAS } from "../lib/constants";
import NavBar from "../components/NavBar";
import MultiSelect from "../components/MultiSelect";
import { useAuth } from "../contexts/AuthContext";
import {
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { ESTADOS_BR } from "../lib/constants";

const ScrollableTags = ({ title, tags, colorType }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 2);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 200);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tags]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 400);
    }
  };

  const tagStyle =
    colorType === "interest"
      ? { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "transparent" }
      : colorType === "success"
      ? { background: "var(--success-bg)", color: "var(--success)", borderColor: "transparent" }
      : {};

  return (
    <div
      className="profile-card__areas-group"
      style={{ width: "100%", minWidth: 0, overflow: "hidden" }}
    >
      <span className="profile-card__bio-label">
        {title}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minWidth: 0,
          width: "100%",
          position: "relative",
        }}
      >
        <div
          ref={scrollRef}
          className="scroll-container"
          onScroll={checkScroll}
          style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            flex: 1,
            paddingBottom: "4px",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            maxWidth: "100%",
            maskImage: `linear-gradient(to right, ${showLeft ? "transparent, #000 20px" : "#000"} , ${showRight ? "#000 calc(100% - 20px), transparent" : "#000"})`,
            WebkitMaskImage: `linear-gradient(to right, ${showLeft ? "transparent, #000 20px" : "#000"} , ${showRight ? "#000 calc(100% - 20px), transparent" : "#000"})`,
          }}
        >
          {tags.map((tag, i) => (
            <span
              key={i}
              className="profile-card__area-tag"
              style={{ ...tagStyle, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {tag}
            </span>
          ))}
        </div>

        {showLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="scroll-arrow"
            style={{ position: "absolute", left: 2 }}
          >
            <FaChevronLeft size={10} />
          </button>
        )}
        {showRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="scroll-arrow"
            style={{ position: "absolute", right: 2 }}
          >
            <FaChevronRight size={10} />
          </button>
        )}
      </div>
    </div>
  );
};

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [filterEstado, setFilterEstado] = useState("");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      checkProfileAndFetch();
    }
  }, [user, authLoading, navigate]);

  const checkProfileAndFetch = async () => {
    try {
      // 1. Verificar se o perfil está completo
      const { data: profile, error: pError } = await supabase
        .from("profiles")
        .select("nome, telefone, area_atuacao")
        .eq("user_id", user.id)
        .single();

      if (
        pError ||
        !profile ||
        !profile.nome ||
        !profile.telefone ||
        !profile.area_atuacao
      ) {
        navigate("/perfil");
        return;
      }

      // 2. Se sim, buscar todos os perfis
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Erro ao buscar perfis:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
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

  const filteredProfiles = profiles.filter((p) => {
    const nome = p.nome || "";
    const cidade = p.cidade || "";
    const cargo = p.cargo || "";
    const searchLower = search.toLowerCase();

    const matchSearch =
      nome.toLowerCase().includes(searchLower) ||
      cidade.toLowerCase().includes(searchLower) ||
      cargo.toLowerCase().includes(searchLower);

    const matchArea = selectedAreas.length > 0
      ? selectedAreas.some(area => {
          if (area === "Outros") {
            // Filtra quem tem áreas customizadas (não presentes na lista padrão)
            const hasCustomAtuacao = p.area_atuacao
              ?.split(",")
              .some((tag) => {
                const t = tag.trim();
                return t && !AREAS.includes(t);
              });
            const hasCustomInteresse = p.area_interesse
              ?.split(",")
              .some((tag) => {
                const t = tag.trim();
                return t && !AREAS.includes(t);
              });
            return hasCustomAtuacao || hasCustomInteresse;
          }
          return p.area_atuacao?.includes(area) || p.area_interesse?.includes(area);
        })
      : true;

    const matchEstado = filterEstado ? p.estado === filterEstado : true;

    return matchSearch && matchArea && matchEstado;
  });

  return (
    <div className="page-wrapper">
      <NavBar />

      <div className="filters-container">
        <div className="filters-main">
          <div className="search-field-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="search"
              className="field__input search-input"
              placeholder="Buscar por nome, cargo ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-select-wrapper">
            <select
              className="field__select filter-select"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos os Estados</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-areas-row" style={{ marginTop: '0' }}>
          <div className="filter-areas-label" style={{ marginBottom: '8px' }}>
            <FaFilter size={12} />
            <span>Filtrar por Área(s):</span>
          </div>
          <MultiSelect
            options={[...AREAS, "Outros"]}
            selected={selectedAreas}
            onChange={setSelectedAreas}
            placeholder="Selecione as áreas para filtrar..."
            hideCustom
          />
        </div>
      </div>

      <div className="directory-grid">
        {loading ? (
          <>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
          </>
        ) : filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile) => {
            const atuacaoTags = profile.area_atuacao
              ? profile.area_atuacao
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean)
              : [];
            const interesseTagsRaw = profile.area_interesse
              ? profile.area_interesse
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean)
              : [];
            const interesseTags =
              interesseTagsRaw.length > 0 ? interesseTagsRaw : ["Outros"];

            return (
              <div key={profile.id} className="profile-card-wrapper">
                <div className="profile-card">
                  <div className="profile-card__info">
                    <div className="profile-card__header">
                      {profile.foto_url ? (
                        <img
                          src={profile.foto_url}
                          alt={profile.nome}
                          className="profile-card__avatar"
                        />
                      ) : (
                        <div className="profile-card__avatar profile-card__avatar--placeholder">
                          {(profile.nome || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="profile-card__header-content">
                        <h3 className="profile-card__name">{profile.nome}</h3>
                        {profile.cargo && (
                          <div className="profile-card__cargo">
                            {profile.cargo}
                          </div>
                        )}
                        <div className="profile-card__location">
                          {profile.cidade || "N/A"}, {profile.estado || "N/A"}
                        </div>
                      </div>
                    </div>
                    {atuacaoTags.length > 0 && (
                      <ScrollableTags 
                        title="Atuação" 
                        tags={atuacaoTags} 
                        colorType="interest"
                      />
                    )}
                    <ScrollableTags
                      title="Interesse"
                      tags={interesseTags}
                      colorType="success"
                    />
                  </div>

                  <div className="profile-card__bio-group">
                    <span className="profile-card__bio-label">
                      Biografia
                    </span>
                    <div className="profile-card__bio">
                      {profile.sobre || (
                        <span style={{ fontStyle: "italic", opacity: 0.5 }}>
                          Sem biografia.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="profile-card__links">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-social btn-social--linkedin"
                        title="LinkedIn"
                      >
                        <FaLinkedin size={18} />
                      </a>
                    )}
                    {profile.telefone && profile.mostrar_telefone !== false && (
                      <a
                        href={`https://wa.me/55${profile.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-social btn-social--whatsapp"
                        title="WhatsApp"
                      >
                        <FaWhatsapp size={18} />
                      </a>
                    )}
                    {profile.email && profile.mostrar_email === true && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="btn-social btn-social--email"
                        title="E-mail"
                      >
                        <FaEnvelope size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <h3>Nenhum profissional encontrado</h3>
            <p className="empty-state__text">
              Tente ajustar seus filtros de busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
