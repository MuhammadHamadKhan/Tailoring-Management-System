import api from "../api/api";

export const createOrder = async (orderData) => {
  const response = await api.post("/api/order/create", orderData);
  return response.data;
};

export const getAllOrders = async (params = {}) => {
  const response = await api.get("/api/order/getAll", {
    params,
  });

  return response.data;
};

export const getOneOrder = async (id) => {
  const response = await api.get(`/api/order/getOne/${id}`);
  return response.data;
};

export const updateOrder = async (id, data) => {
  const response = await api.patch(`/api/order/update/${id}`, data);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/api/order/delete/${id}`);
  return response.data;
};

export const getOneCustomerOrders = async (id) => {
  const response = await api.get(`/api/order/customer/${id}`);
  return response.data;
};
