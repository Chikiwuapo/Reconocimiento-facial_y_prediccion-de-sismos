import { useState } from 'react';
import Style from './btnLogOut.module.css';


export default function BtnLogOut() {

  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);
    try {

      // window.location.reload(); // Eliminado para no recargar la página
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogOut}
      className={Style.btnLogOut}
      disabled={loading}
    >
      {loading ? (
        <span className={Style.spinnerContainer}>
          <span className={Style.spinner}></span>
          Cerrando...
        </span>
      ) : (
        'Cerrar sesión'
      )}
    </button>
  );
}
