import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import authStore from "../store/store";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setLogout = authStore((state) => state.setLogout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await setLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:ml-72">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
