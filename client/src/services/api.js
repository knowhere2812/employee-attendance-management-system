import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("attendance_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = localStorage.getItem("attendance_refresh_token");
    if (
      error.response?.status !== 401 ||
      request._retry ||
      !refreshToken ||
      request.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }
    request._retry = true;
    try {
      const { data } = await api.post("/auth/refresh", { refreshToken });
      localStorage.setItem("attendance_token", data.accessToken);
      localStorage.setItem("attendance_refresh_token", data.refreshToken);
      request.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(request);
    } catch (refreshError) {
      localStorage.removeItem("attendance_token");
      localStorage.removeItem("attendance_refresh_token");
      localStorage.removeItem("attendance_user");
      return Promise.reject(refreshError);
    }
  },
);
export default api;
