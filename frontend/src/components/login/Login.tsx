import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFastAPI from "../../hooks/useFastAPI";
import useAuth from "../../hooks/useAuth";

type Props = {};

export const Login: React.FC<Props> = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("user3");
  const [password, setPassword] = useState("user3");

  const { setAuth } = useAuth();
  const fastAPI = useFastAPI(false);
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const handleSumbit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fastAPI.post(
        "/auth/token",
        new URLSearchParams({ username, password }),
        {
          withCredentials: true,
        }
      );

      localStorage.setItem(
        "site",
        JSON.stringify({ ...response?.data, username })
      );

      setAuth({ ...response?.data, username });
      setUsername("");
      setPassword("");

      navigate(location.state?.from?.pathname || "/product-form");
    } catch (error: any) {
      if (!error?.response) {
        setErrorMessage("No server response");
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response?.data?.detail); // 400, 401 handled by backend
      } else {
        setErrorMessage("Login failed");
      }

      errorRef.current?.focus();
      setPassword("");
    }
  };

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  return (
    <section>
      {errorMessage && (
        <p ref={errorRef} className="errorMessage" aria-live="assertive">
          {errorMessage}
        </p>
      )}
      <h1>Sign In</h1>
      <form onSubmit={handleSumbit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          ref={usernameRef}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button>Login</button>
      </form>
    </section>
  );
};
