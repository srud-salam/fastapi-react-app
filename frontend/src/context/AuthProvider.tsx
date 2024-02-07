import React, { createContext, useState, ReactNode } from "react";

type AuthType = {
  username: string;
  access_token: string;
  token_type: string;
  expires_in: number;
};

type AuthContextType = {
  auth: AuthType | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthType | null>>;
};

const userSession = localStorage.getItem("site");
const userSessionParse = userSession ? JSON.parse(userSession) : {};

const AuthContext = createContext<AuthContextType>({
  auth: userSessionParse,
  setAuth: () => {},
});

type Props = {
  children: ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [auth, setAuth] = useState<AuthType | null>(userSessionParse);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
