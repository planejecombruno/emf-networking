import { useState, useRef, useEffect, useMemo } from 'react'

export default function MultiSelect({ options, selected, onChange, placeholder, hideCustom, hideSelectedTags }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customValue, setCustomValue] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredOptions = useMemo(() => {
    const lowerSearch = search.toLowerCase()
    return options.filter(opt => opt.toLowerCase().includes(lowerSearch))
  }, [options, search])

  const toggle = (item) => {
    if ((item === 'Outro' || item === 'Outros') && !hideCustom) {
      setShowCustom(true)
      setOpen(false)
      setSearch('')
      return
    }

    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item))
    } else {
      onChange([...selected, item])
    }
    setSearch('')
  }

  const addCustom = () => {
    const val = customValue.trim()
    if (val && !selected.includes(val)) {
      onChange([...selected, val])
      setCustomValue('')
      setShowCustom(false)
    }
  }

  const removeTag = (item) => {
    onChange(selected.filter((s) => s !== item))
  }

  return (
    <div className="multi-select" ref={ref}>
      {!hideSelectedTags && selected.length > 0 && (
        <div className="multi-select__tags">
          {selected.map((item) => (
            <span className="multi-select__tag" key={item}>
              {item}
              <button type="button" onClick={() => removeTag(item)} aria-label={`Remover ${item}`}>×</button>
            </span>
          ))}
        </div>
      )}
      
      <input
        type="text"
        className="field__input"
        placeholder={placeholder || 'Buscar e selecionar...'}
        onFocus={() => setOpen(true)}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {open && (
        <div className="multi-select__dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                className={`multi-select__option ${selected.includes(opt) ? 'multi-select__option--selected' : ''}`}
                onClick={() => toggle(opt)}
              >
                {selected.includes(opt) ? '✓ ' : ''}{opt}
              </div>
            ))
          ) : (
            <div className="multi-select__option" style={{ color: 'var(--text-muted)' }}>Nenhum resultado</div>
          )}
          
          {!hideCustom && (
            <div 
              className="multi-select__option" 
              style={{ borderTop: '1px solid var(--border)', fontWeight: 500, color: 'var(--accent)' }}
              onClick={() => toggle('Outro')}
            >
              + Outro
            </div>
          )}
        </div>
      )}

      {showCustom && (
        <div className="custom-input-row" style={{ marginTop: '12px', padding: '12px', background: 'rgba(30,58,95,0.03)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
          <input
            type="text"
            className="field__input"
            placeholder="Digite a nova área..."
            value={customValue}
            autoFocus
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          />
          <button type="button" onClick={addCustom}>Adicionar</button>
          <button type="button" onClick={() => setShowCustom(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
