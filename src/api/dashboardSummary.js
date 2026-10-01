import api from "./api";

export const dashboardSummary = async () => {
  const response = await api.get("/api/dashboard/summary");
  return response.data;
};
