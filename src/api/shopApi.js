import api from "../api/api"

export const updateShopSettings = async (payload) => {
   const response = await api.put("/api/shop/settings", payload);
   return response.data
}
