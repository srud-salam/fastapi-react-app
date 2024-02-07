import axios, { AxiosInstance } from "axios";

const baseURL = "http://127.0.0.1:8000/api/v1";
// const baseURL = "https://webappbrit.azurewebsites.net/api/v1";

// singleton pattern
export default function getApiInstance(
  requireCredential: boolean,
): AxiosInstance {
  if (requireCredential) {
    return axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  }

  return axios.create({ baseURL });
}
