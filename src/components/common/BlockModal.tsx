import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import type { User } from '../../types';
import { useEpify } from '../../context/EpifyContext';

interface BlockModalProps {
  userToBlock: User;
  onClose: () => void;
  onBlocked?: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({ userToBlock, onClose, onBlocked }) => {
  const { blockUser } = useEpify();

  const handleConfirm = () => {
    blockUser(userToBlock.id);
    if (onBlocked) onBlocked();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <ShieldAlert size={20} color="var(--danger)" />
            ¿Bloquear a {userToBlock.name}?
          </h3>
          <button className="btn-icon-subtle" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: 12 }}>
            Si bloqueas a <strong>{userToBlock.name}</strong> (@{userToBlock.username}):
          </p>
          <ul
            style={{
              paddingLeft: 20,
              fontSize: '0.86rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              color: 'var(--text-secondary)',
            }}
          >
            <li>Ya no podrá enviarte mensajes.</li>
            <li>No podrá ver si estás disponible o conectado.</li>
            <li>Dejarán de ser amigos en Epify.</li>
            <li>Puedes desbloquearlo más adelante en tu perfil si cambias de opinión.</li>
          </ul>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-muted" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-danger-outline"
            style={{ background: 'var(--danger)', color: '#FFFFFF' }}
            onClick={handleConfirm}
          >
            Sí, Bloquear
          </button>
        </div>
      </div>
    </div>
  );
};
