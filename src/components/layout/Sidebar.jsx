import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Store,
  X,
} from "lucide-react";

import authStore from "../../store/store";

export default function Sidebar({ isOpen, onClose, onLogout }) {
  const shop = authStore((state) => state.shop);

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`
    fixed top-0 left-0 z-50 h-screen w-72
    border-r border-[#5A3A27] bg-[#3B2417]
    flex flex-col
    transition-transform duration-300 ease-in-out
    lg:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        {/* Shop Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#5A3A27] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#5A3825] to-[#24140B] text-white shadow-lg ring-1 ring-white/15">
              <Store size={20} strokeWidth={1.75} />
            </div>

            <div className="max-w-[150px]">
              <h1 className="text-[16px] font-bold text-white truncate">
                {shop?.shopName || "Darzi."}
              </h1>

              <p className="text-xs font-medium text-[#D6C4B7] truncate">
                {shop?.ownerName || "Shop Manager"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#D6C4B7] transition-colors hover:bg-[#4A2D1D] hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-[#BFA99A]">
            Menu
          </p>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
            flex items-center gap-3 rounded-xl px-4 py-3.5
            text-[15px] font-semibold
            transition-all duration-200
            ${
              isActive
                ? "bg-primary text-white shadow-md shadow-primary/20 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-white"
                : "text-[#E7D8CC] hover:bg-[#4A2D1D] hover:text-white hover:translate-x-0.5"
            } transition-all duration-200 cursor-pointer
            `
                  }
                >
                  <Icon size={20} strokeWidth={2} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-[#5A3A27] p-4">
          <button
            onClick={onLogout}
            className="
      group flex w-full cursor-pointer items-center gap-3 rounded-xl
      px-4 py-3.5
      text-[15px] font-semibold text-[#E7D8CC]
      transition-all duration-200
      hover:bg-red-500 hover:text-white
      active:scale-[0.98]
    "
          >
            <LogOut
              size={20}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-300"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
