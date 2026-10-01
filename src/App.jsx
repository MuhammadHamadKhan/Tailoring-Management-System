import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/dashboard/orders/Orders";
import CreateOrder from "./pages/dashboard/orders/CreateOrder";
import OrderDetails from "./pages/dashboard/orders/OrderDetails";
import Customers from "./pages/dashboard/customers/Customers";
import CustomerDetails from "./pages/dashboard/customers/CustomerDetails";
import Protectedroute from "./pages/Protectedroute";
import authStore from "./store/store";
import Settings from "./pages/dashboard/settings/Settings";

function App() {
  const checkAuth = authStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<Protectedroute />}>
        <Route path="/" element={<DashboardLayout />}>
          {/* Dashboard — loads by default at "/" */}
          <Route index element={<Dashboard />} />

          {/* Orders */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/create" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetails />} />

          {/* Customers */}
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetails />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;