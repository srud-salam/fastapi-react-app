import { useEffect } from "react";
import getApiInstance from "../utils/api";
import useAuth from "./useAuth";

const useFastAPI = (requireCredential: boolean = true) => {
  const { auth, setAuth } = useAuth();
  const fastAPI = getApiInstance(requireCredential);

  useEffect(() => {
    const refreshToken = async () => {
      const response = await fastAPI.get("/auth/refresh", {
        withCredentials: true,
      });

      setAuth({ ...auth, ...response.data });
      return response.data.access_token;
    };

    const requestIntercept = fastAPI.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"])
          config.headers["Authorization"] = `Bearer ${auth?.access_token}`;
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = fastAPI.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          const newAccessToken = await refreshToken();
          prevRequest.sent = true;
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return fastAPI(prevRequest);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      fastAPI.interceptors.request.eject(requestIntercept);
      fastAPI.interceptors.response.eject(responseIntercept);
    };
  }, [auth, fastAPI, setAuth]);

  return fastAPI;
};

export default useFastAPI;
