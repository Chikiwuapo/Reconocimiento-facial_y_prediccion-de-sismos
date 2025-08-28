import { useEffect, useMemo, useState } from 'react';
import styles from './Settings.module.css';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  USER_ROLES,
  USER_STATUSES,
} from '@/services/userService.ts';

interface UserRow {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string | null;
}

type ModalMode = 'create' | 'edit';

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [confirmId, setConfirmId] = useState<number | string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    id?: number | string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar: string | null; // base64 o url
    avatarFile?: File | null;
  }>({
    name: '',
    email: '',
    role: USER_ROLES[1] || 'Usuario',
    status: USER_STATUSES[0] || 'Activo',
    avatar: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    try {
      const data = getUsers();
      setUsers(data as unknown as UserRow[]);
    } catch (e) {
      setToastError('No se pudieron cargar los usuarios');
      setTimeout(() => setToastError(null), 2400);
    }
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(users.length / pageSize)), [users.length]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [users.length, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const onClickDelete = (id: number | string) => {
    if (deleting) return;
    setConfirmId(id);
  };

  const doDelete = async () => {
    if (confirmId == null) return;
    try {
      setDeleting(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      deleteUser(confirmId);
      setUsers(prev => prev.filter(u => String(u.id) !== String(confirmId)));
      setShowToast('Usuario eliminado correctamente');
    } catch (e) {
      setToastError('No se pudo eliminar el usuario');
    } finally {
      setDeleting(false);
      setConfirmId(null);
      setTimeout(() => { setShowToast(null); setToastError(null); }, 2400);
    }
  };

  const openCreate = () => {
    setFormError(null);
    setModalMode('create');
    setFormData({ name: '', email: '', role: USER_ROLES[1] || 'Usuario', status: USER_STATUSES[0] || 'Activo', avatar: null, avatarFile: null });
    setModalOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setFormError(null);
    setModalMode('edit');
    setFormData({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, avatar: user.avatar, avatarFile: null });
    setModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData(prev => ({ ...prev, avatarFile: file }));
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'El nombre es obligatorio';
    if (!formData.email.trim()) return 'El correo es obligatorio';
    if (modalMode === 'create' && !formData.avatarFile) return 'La foto es obligatoria';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setFormError(err); return; }
    try {
      setSaving(true);
      let avatar = formData.avatar;
      if (formData.avatarFile) {
        avatar = await toBase64(formData.avatarFile);
      }
      if (modalMode === 'create') {
        const created = createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role as any,
          status: formData.status as any,
          avatar,
        });
        setUsers(prev => [created as unknown as UserRow, ...prev]);
        setShowToast('Usuario creado');
      } else {
        const updated = updateUser(formData.id!, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role as any,
          status: formData.status as any,
          avatar,
        });
        setUsers(prev => prev.map(u => String(u.id) === String(formData.id) ? (updated as unknown as UserRow) : u));
        setShowToast('Usuario actualizado');
      }
      setModalOpen(false);
    } catch (e) {
      setToastError('Ocurrió un error al guardar');
    } finally {
      setSaving(false);
      setTimeout(() => { setShowToast(null); setToastError(null); }, 2400);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
        <div>
          <button className={styles.primaryButton} onClick={openCreate}>Agregar usuario</button>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, i) => (
                <tr key={`${user.id}-${startIndex + i}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--stroke)' }} />
                      )}
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.badge} ${user.role === 'Administrador' ? styles.badgePrimary : styles.badgeSecondary}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${user.status === 'Activo' ? styles.badgeSuccess : styles.badgeDanger}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.iconButton}
                      title="Editar"
                      onClick={() => openEdit(user)}
                    >
                      <span>✏️</span>
                    </button>
                    <button
                      className={styles.iconButton}
                      title="Eliminar"
                      onClick={() => onClickDelete(user.id)}
                      disabled={deleting}
                    >
                      <span>🗑️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span>
            {users.length === 0
              ? 'Mostrando 0 de 0 resultados'
              : `Mostrando ${startIndex + 1}-${Math.min(endIndex, users.length)} de ${users.length} resultados`}
          </span>
          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p: number) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={currentPage === p ? styles.active : ''}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      {/* Modal de confirmación eliminar */}
      {confirmId !== null && (
        <div
          className={styles.modalOverlay}
          onClick={() => { if (!deleting) setConfirmId(null); }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar eliminación</h3>
            </div>
            <div className={styles.modalBody}>
              <p>¿Seguro que deseas eliminar este usuario?</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setConfirmId(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={doDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className={styles.spinner} /> Eliminando...
                  </>
                ) : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar usuario */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => { if (!saving) setModalOpen(false); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{modalMode === 'create' ? 'Agregar usuario' : 'Editar usuario'}</h3>
            </div>
            <form onSubmit={onSubmit}>
              <div className={styles.modalBody}>
                {formError && (
                  <p style={{ color: '#ff5a5a', marginTop: 0 }}>{formError}</p>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="name">Nombre</label>
                  <input
                    id="name"
                    name="name"
                    className={styles.input}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Correo</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={styles.input}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Rol</label>
                  <select id="role" name="role" className={styles.select} value={formData.role} onChange={handleInputChange}>
                    {USER_ROLES.map((r: string) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Estado</label>
                  <select id="status" name="status" className={styles.select} value={formData.status} onChange={handleInputChange}>
                    {USER_STATUSES.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="avatar">Foto {modalMode === 'create' ? '(obligatoria)' : '(opcional)'}</label>
                  <input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleFileChange} className={styles.input} />
                  {(formData.avatar || formData.avatarFile) && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--stroke)' }}>
                        <img
                          src={formData.avatarFile ? URL.createObjectURL(formData.avatarFile) : (formData.avatar as string)}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span style={{ color: 'var(--muted)' }}>Previsualización</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
                <button type="submit" className={styles.saveButton} disabled={saving}>
                  {saving ? (<><span className={styles.spinner} /> Guardando...</>) : (modalMode === 'create' ? 'Crear' : 'Guardar cambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      {showToast && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <span className={styles.toastIcon} />
          <span>{showToast}</span>
        </div>
      )}
      {toastError && (
        <div className={styles.toast}>
          <span className={styles.toastIcon} />
          <span>{toastError}</span>
        </div>
      )}
    </div>
  );
}
