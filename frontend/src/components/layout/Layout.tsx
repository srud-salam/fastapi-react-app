import useAuth from "../../hooks/useAuth";
import useFastAPI from "../../hooks/useFastAPI";
import styles from "./Layout.module.scss";
import { Outlet, useNavigate } from "react-router-dom";

export const Layout = () => {
  const fastAPI = useFastAPI();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const signOut = async () => {
    setAuth(null);
    localStorage.removeItem("site");
    await fastAPI.get(`/auth/logout`);
    navigate("/");
  };

  return (
    <main className={styles.layout}>
      <header className={styles.header}>
        {auth ? (
          <button onClick={() => signOut()}>Sign Out</button>
        ) : (
          <button onClick={() => navigate("/signup")}>Sign Up</button>
        )}
      </header>
      <Outlet />
    </main>
  );
};
