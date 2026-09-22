import React, { useState } from 'react';
import {
  UserPlus,
  Trash2,
  Search,
  Users,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle,
  KeyRound,
  Calendar,
} from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import type { User } from '../../types';

export const AdminView: React.FC = () => {
  const { currentUser, users, adminCreateUser, adminDeleteUser } = useEpify();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados del modal de creación
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('🧒');
  const [newPin, setNewPin] = useState('1234');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newStatusMsg, setNewStatusMsg] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const avatarChoices = [
    '🧒', '👧', '👦', '🧑‍🚀', '🎨', '🦖', '⚽', '🦄', '🐼', '🚀', '🌟', '🛡️', '👑', '🧑‍🏫', '🦁', '🦊'
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    const isUserAdmin = u.role === 'admin';
    if (roleFilter === 'admin') return matchesSearch && isUserAdmin;
    if (roleFilter === 'user') return matchesSearch && !isUserAdmin;
    return matchesSearch;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const kidsCount = totalUsers - adminCount;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) {
      setActionError('Nombre y @usuario son requeridos');
      return;
    }

    setCreateLoading(true);
    setActionError(null);

    const res = await adminCreateUser({
      name: newName.trim(),
      username: newUsername.trim(),
      avatar: newAvatar,
      pin: newPin.trim() || '1234',
      role: newRole,
      statusMessage: newStatusMsg.trim() || undefined,
      badge: newRole === 'admin' ? 'Administrador 🛡️' : 'Nuevo Amigo ✨',
    });

    setCreateLoading(false);

    if (res.success) {
      setShowCreateModal(false);
      setNewName('');
      setNewUsername('');
      setNewPin('1234');
      setNewAvatar('🧒');
      setNewRole('user');
      setNewStatusMsg('');
      setActionSuccess(`¡Cuenta @${res.user?.username} creada exitosamente!`);
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      setActionError(res.error || 'Error al crear la cuenta');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setActionError(null);

    const res = await adminDeleteUser(userToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      const deletedName = userToDelete.username;
      setUserToDelete(null);
      setActionSuccess(`Cuenta @${deletedName} eliminada correctamente del sistema.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      setActionError(res.error || 'Error al eliminar la cuenta');
    }
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Cabecera del Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>🛡️</span>
            <h2 style={{ fontSize: '1.4rem' }}>Panel de Administración</h2>
            <span
              className="user-badge-tag"
              style={{ background: 'var(--brand-primary)', color: '#FFFFFF', fontWeight: 800 }}
            >
              Control Maestro
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Gestión completa de usuarios, supervisión y seguridad de la plataforma Epify.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setActionError(null);
            setShowCreateModal(true);
          }}
          style={{ padding: '10px 18px', gap: 8, fontSize: '0.9rem' }}
        >
          <UserPlus size={18} /> Crear Nueva Cuenta
        </button>
      </div>

      {/* Avisos de Éxito / Error */}
      {actionSuccess && (
        <div
          className="animate-pop-in"
          style={{
            background: 'var(--accent-green-light)',
            color: 'var(--accent-green)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.88rem',
            fontWeight: 700,
            border: '1px solid #B7EB8F',
          }}
        >
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div
          className="animate-pop-in"
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.88rem',
            fontWeight: 700,
            border: '1px solid #FFA39E',
          }}
        >
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        <div className="stat-card" style={{ padding: '14px 16px', gap: 12 }}>
          <div style={{ fontSize: '1.6rem' }}>👥</div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{totalUsers}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cuentas Totales</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '14px 16px', gap: 12 }}>
          <div style={{ fontSize: '1.6rem' }}>🧒</div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              {kidsCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cuentas de Niños</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '14px 16px', gap: 12 }}>
          <div style={{ fontSize: '1.6rem' }}>🛡️</div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-secondary)' }}>
              {adminCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Administradores</div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o @usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 36 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={roleFilter === 'all' ? 'btn-primary' : 'btn-muted'}
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            onClick={() => setRoleFilter('all')}
          >
            Todos ({totalUsers})
          </button>
          <button
            className={roleFilter === 'user' ? 'btn-primary' : 'btn-muted'}
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            onClick={() => setRoleFilter('user')}
          >
            Niños ({kidsCount})
          </button>
          <button
            className={roleFilter === 'admin' ? 'btn-primary' : 'btn-muted'}
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            onClick={() => setRoleFilter('admin')}
          >
            Admins ({adminCount})
          </button>
        </div>
      </div>

      {/* Lista / Directorio de Usuarios Administrable */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>USUARIOS REGISTRADOS ({filteredUsers.length})</span>
          <span>ACCIONES</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>No se encontraron cuentas con ese criterio.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredUsers.map((u, idx) => {
              const isSelf = u.id === currentUser?.id;
              const isUserAdmin = u.role === 'admin';

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderBottom: idx < filteredUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                    background: isSelf ? '#F9FBFF' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        fontSize: '1.8rem',
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-full)',
                        background: isUserAdmin ? '#EDE9FE' : 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isUserAdmin ? '2px solid #C4B5FD' : '1.5px solid var(--border-color)',
                      }}
                    >
                      {u.avatar}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                          {u.name}
                        </span>
                        {isUserAdmin ? (
                          <span
                            className="user-badge-tag"
                            style={{ background: '#EDE9FE', color: '#6D28D9', display: 'inline-flex', gap: 4 }}
                          >
                            <ShieldCheck size={11} /> Admin
                          </span>
                        ) : (
                          <span
                            className="user-badge-tag"
                            style={{ background: 'var(--accent-green-light)', color: '#0F766E' }}
                          >
                            Niño
                          </span>
                        )}
                        {isSelf && (
                          <span
                            className="user-badge-tag"
                            style={{ background: '#DBEAFE', color: '#1E40AF' }}
                          >
                            Tú
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          @{u.username}
                        </span>
                        {u.createdAt && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <Calendar size={11} />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones para la cuenta */}
                  <div>
                    {isSelf ? (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          padding: '6px 12px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                        }}
                      >
                        Sesión Activa
                      </span>
                    ) : (
                      <button
                        className="btn-danger-outline"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          gap: 6,
                          borderRadius: 'var(--radius-md)',
                        }}
                        onClick={() => {
                          setActionError(null);
                          setUserToDelete(u);
                        }}
                        title={`Eliminar cuenta de @${u.username}`}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL DE CREACIÓN DE CUENTA ================= */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-dialog animate-pop-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440 }}
          >
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={20} color="var(--brand-primary)" />
                Crear Nueva Cuenta
              </h3>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Como administrador, puedes registrar cuentas para niños o nuevos administradores del sistema.
                </p>

                {/* Selector de Rol */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Tipo de Cuenta (Rol):
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setNewRole('user');
                        setNewAvatar('🧒');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: newRole === 'user' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-color)',
                        background: newRole === 'user' ? 'var(--brand-light)' : 'transparent',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>🧒</span> Usuario Niño
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewRole('admin');
                        setNewAvatar('🛡️');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: newRole === 'admin' ? '2px solid #7C3AED' : '1.5px solid var(--border-color)',
                        background: newRole === 'admin' ? '#F5F3FF' : 'transparent',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>🛡️</span> Administrador
                    </button>
                  </div>
                </div>

                {/* Nombre y Username */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Nombre Completo / Apodo:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: David"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Identificador Único (@usuario):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: david_pro"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                {/* PIN de 4 dígitos */}
                <div>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 4,
                    }}
                  >
                    <KeyRound size={13} /> PIN de Seguridad (4 dígitos):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="1234"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    style={{ width: '100%', letterSpacing: 3, fontWeight: 700 }}
                    required
                  />
                </div>

                {/* Selección de Avatar */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Avatar Seleccionado:
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: 6,
                      background: 'var(--bg-secondary)',
                      padding: 8,
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    {avatarChoices.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setNewAvatar(av)}
                        style={{
                          fontSize: '1.4rem',
                          padding: 4,
                          borderRadius: 'var(--radius-sm)',
                          border: newAvatar === av ? '2px solid var(--brand-primary)' : '1px solid transparent',
                          background: newAvatar === av ? '#FFFFFF' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mensaje de estado opcional */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Mensaje de bienvenida (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: ¡Listo para jugar y divertirme! 🎉"
                    value={newStatusMsg}
                    onChange={(e) => setNewStatusMsg(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createLoading}
                  style={{ minWidth: 120 }}
                >
                  {createLoading ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ================= */}
      {userToDelete && (
        <div className="modal-overlay" onClick={() => setUserToDelete(null)}>
          <div
            className="modal-dialog animate-pop-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <div className="modal-header" style={{ borderBottomColor: '#FEE2E2' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
                <AlertTriangle size={22} color="var(--danger)" />
                ¿Eliminar cuenta de usuario?
              </h3>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={() => setUserToDelete(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{userToDelete.avatar}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{userToDelete.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    @{userToDelete.username}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                }}
              >
                <strong>Advertencia permanente:</strong> Esta acción borrará la cuenta, todas sus solicitudes de amistad, conversaciones privadas y mensajes asociados en Epify.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ minWidth: 140 }}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
