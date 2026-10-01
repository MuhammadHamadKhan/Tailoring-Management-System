import api from "./api";

export const registerApi = async (payload) => {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
};
export const loginApi = async (payload) => {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
};
export const demoApi = async () => {
  const response = await api.post("/api/auth/demo/login");
  return response.data;
};
export const logoutApi = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};
export const authMe = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};
