import React, { useState } from 'react';
import { UserPlus, X, Sparkles } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';

interface RegisterModalProps {
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const { register } = useEpify();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('1234');
  const [avatar, setAvatar] = useState('🧒');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const avatarChoices = ['🧒', '👧', '👦', '🧑‍🚀', '🎨', '🦖', '🎵', '⚽', '🦄', '🐼', '🚀', '🌟'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      setError('Por favor ingresa tu nombre y un @usuario.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await register(name, username, avatar, pin);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Error al crear la cuenta.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <UserPlus size={20} color="var(--primary)" />
            Crear cuenta de niño en Epify
          </h3>
          <button className="btn-icon-subtle" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Crea tu perfil seguro para chatear con tus amigos en Epify.
            </p>

            {error && (
              <div
                style={{
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Tu nombre:
              </label>
              <input
                type="text"
                placeholder="Ej: Daniel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Tu identificador (@usuario):
              </label>
              <input
                type="text"
                placeholder="Ej: dani_pro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Elige tu avatar:
              </label>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {avatarChoices.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    style={{
                      fontSize: '1.5rem',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-md)',
                      background: avatar === av ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      border: `2px solid ${avatar === av ? 'var(--primary)' : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                PIN de acceso (4 dígitos):
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Usa este PIN para volver a entrar a tu cuenta.
              </span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-muted" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Sparkles size={14} />
              {loading ? 'Creando...' : 'Crear mi cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
