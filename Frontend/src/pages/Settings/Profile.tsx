import { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { getCurrentUser, updateCurrentUser } from '@/services/userService.ts';
import { useTheme } from '@/context/ThemeContext';

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: 'Usuario Demo',
    email: 'usuario@demo.com',
    role: 'Administrador',
    notifications: true,
    theme: 'light',
    avatar: null as string | null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        notifications: user.notifications ?? true,
        theme: user.theme ?? 'light',
        avatar: user.avatar ?? null,
      });
    }
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setAvatarFile(file);
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const doSave = async () => {
    try {
      setSaving(true);
      await new Promise<void>((r) => setTimeout(r, 200));
      let avatar = formData.avatar;
      if (avatarFile) {
        avatar = await toBase64(avatarFile);
      }
      updateCurrentUser({
        name: formData.name.trim(),
        notifications: formData.notifications,
        theme: formData.theme as any,
        avatar,
      });
      if (formData.theme !== theme) {
        toggleTheme();
      }
      setAvatarFile(null);
      setFormData(prev => ({ ...prev, avatar }));
      window.dispatchEvent(new Event('profile:saved'));
    } finally {
      setSaving(false);
      setShowConfirm(false);
      setShowToast('Cambios guardados correctamente');
      setTimeout(() => setShowToast(null), 2400);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Perfil de Usuario</h1>
        <p>Actualiza tu información personal y preferencias</p>
      </header>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: '#ff5a5a', marginTop: 0 }}>{error}</p>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="avatar">Foto de perfil</label>
            <input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className={styles.input} />
            {(avatarFile || formData.avatar) && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--stroke)' }}>
                  <img
                    src={avatarFile ? URL.createObjectURL(avatarFile) : (formData.avatar as string)}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ color: 'var(--muted)' }}>Previsualización</span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              disabled
            />
            <p className={styles.helpText}>El correo no puede ser modificado</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
              disabled
            >
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
                className={styles.checkbox}
              />
              Recibir notificaciones por correo
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Tema de la interfaz</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={handleChange}
                  className={styles.radio}
                />
                Claro
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={handleChange}
                  className={styles.radio}
                />
                Oscuro
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
      {showConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => { if (!saving) setShowConfirm(false); }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar guardado</h3>
            </div>
            <div className={styles.modalBody}>
              <p>¿Deseas guardar los cambios realizados en tu perfil?</p>
              <ul>
                <li><strong>Nombre:</strong> {formData.name}</li>
                <li><strong>Correo:</strong> {formData.email}</li>
                <li><strong>Rol:</strong> {formData.role}</li>
                <li><strong>Tema:</strong> {formData.theme === 'dark' ? 'Oscuro' : 'Claro'}</li>
                <li><strong>Notificaciones:</strong> {formData.notifications ? 'Activadas' : 'Desactivadas'}</li>
              </ul>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={doSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className={styles.spinner} />
                    Guardando cambios...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <span className={styles.toastIcon} />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
}
