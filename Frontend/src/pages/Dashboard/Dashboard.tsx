import Sidebar from '../../components/Dashboard/Layout/Sidebar';
import styles from '../../styles/Dashboard.module.css';
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <Sidebar isOpen={false} setIsOpen={() => {}} />
      </div>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
