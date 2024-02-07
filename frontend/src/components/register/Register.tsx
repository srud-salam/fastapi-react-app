import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { PASSWORD_REGEX, USERNAME_REGEX } from "../../utils/constants";
import useFastAPI from "../../hooks/useFastAPI";

type FormInput = {
  usernameInput: boolean;
  passwordInput: boolean;
  confirmPasswordInput: boolean;
};

const formInitialiser = {
  usernameInput: false,
  passwordInput: false,
  confirmPasswordInput: false,
};

export const Register = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formValidate, setFormValidate] = useState<FormInput>(formInitialiser);
  const [formFocus, setFormFocus] = useState<FormInput>(formInitialiser);

  const fastAPI = useFastAPI(false);
  const navigate = useNavigate();
  const usernameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const validateInput = (value: string, isFocus: boolean, isValid: boolean) => {
    return value && isFocus && !isValid ? "showInfo" : "hideInfo";
  };

  const handleSumbit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (!PASSWORD_REGEX.test(password) && password !== confirmPassword) {
        setErrorMessage(
          "Password verification failed. Please re-enter both passwords.",
        );
        setPassword("");
        setConfirmPassword("");
        return;
      }

      await fastAPI.post("/users", { username, password });

      setUsername("");
      setPassword("");
      setConfirmPassword("");
      navigate("/");
    } catch (error: any) {
      if (!error?.response) {
        setErrorMessage("No Server Response");
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response?.data?.detail);
      } else if (error.response?.status === 400) {
        setErrorMessage("Missing Username or Password");
      } else {
        setErrorMessage("Failed to register");
      }
      errorRef.current?.focus();
      setPassword("");
      setConfirmPassword("");
    }
  };

  useEffect(() => {
    setFormValidate({
      usernameInput: USERNAME_REGEX.test(username),
      passwordInput: PASSWORD_REGEX.test(password),
      confirmPasswordInput: password === confirmPassword,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password, confirmPassword]);

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
      <h1>Register</h1>
      <form onSubmit={handleSumbit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          ref={usernameRef}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setFormFocus({ ...formFocus, usernameInput: true })}
          onBlur={() => setFormFocus({ ...formFocus, usernameInput: false })}
          aria-invalid={formValidate?.usernameInput}
          aria-describedby="username-input-id"
          required
        />
        <div
          id="username-input-id"
          className={validateInput(
            username,
            formFocus.usernameInput,
            formValidate.usernameInput,
          )}
        >
          <span className="material-symbols-outlined">info</span>
          <p>4 to 24 characters.</p>
          <p>Must begin with a letter.</p>
          <p>Letters, numbers, underscores, hyphens allowed.</p>
        </div>

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFormFocus({ ...formFocus, passwordInput: true })}
          onBlur={() => setFormFocus({ ...formFocus, passwordInput: false })}
          aria-invalid={formValidate?.passwordInput}
          aria-describedby="password-input-id"
          required
        />
        <div
          id="password-input-id"
          className={validateInput(
            password,
            formFocus.passwordInput,
            formValidate.passwordInput,
          )}
        >
          <span className="material-symbols-outlined">info</span>
          <p>8 to 24 characters.</p>
          <p>
            Must include uppercase and lowercase letters, a number and a special
            character.
          </p>
          <p>
            Allowed special characters:
            <span aria-label="exclamation mark">!</span>
            <span aria-label="at symbol">@</span>
            <span aria-label="hashtag">#</span>
            <span aria-label="dollar sign">$</span>
            <span aria-label="percent">%</span>
          </p>
        </div>

        <label htmlFor="confirm">Confirm Password</label>
        <input
          type="password"
          id="confirm"
          name="confirm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onFocus={() =>
            setFormFocus({ ...formFocus, confirmPasswordInput: true })
          }
          onBlur={() =>
            setFormFocus({ ...formFocus, confirmPasswordInput: false })
          }
          aria-invalid={formValidate?.confirmPasswordInput}
          aria-describedby="confirm-password-input-id"
          required
        />

        <div
          id="confirm-password-input-id"
          className={validateInput(
            confirmPassword,
            formFocus.confirmPasswordInput,
            formValidate.confirmPasswordInput,
          )}
        >
          <span className="material-symbols-outlined">info</span>
          <p>Must match with the first password input field.</p>
        </div>

        <button
          disabled={
            !(
              formValidate.usernameInput &&
              formValidate.passwordInput &&
              formValidate.confirmPasswordInput
            )
          }
        >
          Sign Up
        </button>
      </form>
      <p>
        Already registered?
        <br />
        <span>
          <Link to="/">Sign In</Link>
        </span>
      </p>
    </section>
  );
};
