import api from "./api";

export const createCustomer = async (customerData) => {
  const response = await api.post("/api/customer/add", customerData);
  return response.data;
};

export const getOneCustomer = async (id) => {
  const response = await api.get(`/api/customer/getOne/${id}`);
  return response.data;
};

export const getAll = async () => {
  const response = await api.get("/api/customer/getAll");
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await api.patch(`/api/customer/update/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/api/customer/delete/${id}`);
  return response.data;
};
