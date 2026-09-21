import React, { useState } from 'react';
import { AlertTriangle, X, ShieldCheck } from 'lucide-react';
import type { User } from '../../types';
import { useEpify } from '../../context/EpifyContext';

interface ReportModalProps {
  userToReport: User;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ userToReport, onClose }) => {
  const { reportUser } = useEpify();
  const [selectedReason, setSelectedReason] = useState<string>('Mensajes ofensivos o groseros');
  const [details, setDetails] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const reasons = [
    'Mensajes ofensivos o groseros',
    'Me pidió datos personales o fotos',
    'Me hace sentir incómodo o con miedo',
    'Dice ser otra persona',
    'Otro motivo',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportUser(userToReport.id, selectedReason, details);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <AlertTriangle size={20} color="var(--danger)" />
            Reportar a {userToReport.name}
          </h3>
          <button className="btn-icon-subtle" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--accent-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <ShieldCheck size={32} color="var(--accent-green)" />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>¡Reporte recibido con seguridad!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Gracias por cuidar la comunidad de Epify. Nuestro equipo de seguridad y moderación
              revisará este caso de inmediato. 🛡️
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p style={{ marginBottom: 12 }}>
                En Epify la seguridad es lo primero. Cuéntanos qué sucedió con{' '}
                <strong>{userToReport.name}</strong> (@{userToReport.username}):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {reasons.map((r) => (
                  <label
                    key={r}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: selectedReason === r ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      border: `1.5px solid ${selectedReason === r ? 'var(--primary)' : 'transparent'}`,
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              <textarea
                placeholder="Detalles adicionales (opcional)..."
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{ width: '100%', resize: 'none', fontSize: '0.86rem' }}
              />

              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>🔒 Tu reporte es 100% confidencial y seguro.</span>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-muted" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-danger-outline">
                Enviar Reporte
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
