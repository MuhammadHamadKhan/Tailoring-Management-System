import { create } from "zustand";
import { loginApi, logoutApi, authMe } from "../api/authApi";

const authStore = create((set) => ({
  shop: null,
  isLogin: false,
  isChecking: true,

  setLogin: (data) => {
    set({
      shop: data
        ? {
          shopId: data.shopId,
          shopName: data.shopName,
          ownerName: data.ownerName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          address: data.address,
          status: data.status,
          whatsappNumber: data.whatsappNumber,
          currencySymbol: data.currencySymbol,
          receiptFooterMessage: data.receiptFooterMessage,
          ...data,
        }
        : null,
      isLogin: !!data,
      isChecking: false,
    });
  },

  checkAuth: async () => {
    try {
      set({ isChecking: true });
      const data = await authMe();
      set({
        shop: {
          shopId: data?.shopId,
          shopName: data?.shopName,
          ownerName: data?.ownerName,
          phoneNumber: data?.phoneNumber,
          email: data?.email,
          address: data?.address,
          status: data?.status,
          whatsappNumber: data?.whatsappNumber,
          currencySymbol: data?.currencySymbol,
          receiptFooterMessage: data?.receiptFooterMessage,
        },
        isLogin: true,
        isChecking: false,
      });
      return data;
    } catch (error) {
      set({
        shop: null,
        isLogin: false,
        isChecking: false,
      });
      return null;
    }
  },

  login: async (credentials) => {
    const data = await loginApi(credentials);
    set({
      shop: {
        shopId: data.shopId,
        shopName: data.shopName,
        ownerName: data.ownerName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        status: data.status,
        whatsappNumber: data.whatsappNumber,
        currencySymbol: data.currencySymbol,
        receiptFooterMessage: data.receiptFooterMessage,
      },
      isLogin: true,
      isChecking: false,
    });
    return data;
  },

  // NEW: patch the shop object in the store after a Settings save,
  // so every component reading from authStore sees fresh data immediately
  updateShop: (updatedFields) => {
    set((state) => ({
      shop: state.shop ? { ...state.shop, ...updatedFields } : state.shop,
    }));
  },

  setLogout: async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({
        shop: null,
        isLogin: false,
        isChecking: false,
      });
    }
  },
}));

export default authStore;