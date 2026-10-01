import { useState, useRef, useEffect } from "react";
import { Menu, User, ChevronDown, Mail, Phone, MapPin, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import authStore from "../../store/store.js"; // adjust path to match your project

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const shop = authStore((state) => state.shop);
  const setLogout = authStore((state) => state.setLogout);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname.startsWith("/orders")) return "Orders";
    if (location.pathname.startsWith("/customers")) return "Customers";
    if (location.pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await setLogout();
    navigate("/login");
  };

  // Build initials from shop name for the avatar, e.g. "Darzi Tailoring" -> "DT"
  const initials =
    shop?.shopName
      ?.split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SH";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-surface sm:h-20">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger */}
          <button
            onClick={onMenuClick}
            className="
              flex h-10 w-10 cursor-pointer items-center justify-center
              rounded-xl text-heading
              transition-colors
              hover:bg-bg
              lg:hidden
            "
            aria-label="Open menu"
          >
            <Menu size={23} strokeWidth={2} />
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-lg font-bold text-heading sm:text-xl">
              {getPageTitle()}
            </h1>
            <p className="hidden text-xs font-medium text-muted sm:block">
              Manage your shop with ease
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
          {/* User Profile Trigger */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="
              flex cursor-pointer items-center gap-3 rounded-xl
              p-1.5 sm:px-2 sm:py-1.5
              transition-colors
              hover:bg-bg
            "
          >
            {/* Avatar */}
            <div
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full bg-primary text-xs font-bold text-white
              "
            >
              {initials}
            </div>

            {/* Desktop User Info */}
            <div className="hidden text-left lg:block">
              <p className="text-sm font-bold text-heading">
                {shop?.shopName || "Shop Owner"}
              </p>
              <p className="text-xs font-medium text-muted">
                {shop?.ownerName || "Owner"}
              </p>
            </div>

            {/* Desktop Dropdown Icon */}
            <ChevronDown
              size={17}
              className={`hidden text-muted transition-transform duration-200 lg:block ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown Panel */}
          {isDropdownOpen && (
            <div
              className="
                absolute right-0 top-[calc(100%+10px)] w-72
                rounded-2xl border border-border bg-surface
                shadow-lg
                overflow-hidden
                z-40
              "
            >
              {/* Shop Info Header */}
              <div className="flex items-center gap-3 border-b border-border bg-bg p-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0 items-center justify-center
                    rounded-full bg-primary text-sm font-bold text-white
                  "
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-heading">
                    {shop?.shopName || "Shop Owner"}
                  </p>
                  <p className="truncate text-xs font-medium text-muted">
                    {shop?.ownerName || "Owner"}
                  </p>
                </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-2.5 p-4 text-xs">
                <div className="flex items-center gap-2.5 text-muted">
                  <Mail size={14} className="shrink-0 text-primary" />
                  <span className="truncate font-medium">
                    {shop?.email || "No email on record"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <Phone size={14} className="shrink-0 text-primary" />
                  <span className="truncate font-medium">
                    {shop?.phoneNumber || "No phone on record"}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-muted">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                  <span className="font-medium">
                    {shop?.address || "No address on record"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border p-2">
                <Link
                  to="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="
                    flex cursor-pointer items-center gap-2.5 rounded-xl
                    px-3 py-2.5 text-sm font-bold text-heading
                    transition-colors hover:bg-bg
                  "
                >
                  <Settings size={16} className="text-primary" />
                  <span>Shop Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="
                    flex w-full cursor-pointer items-center gap-2.5 rounded-xl
                    px-3 py-2.5 text-sm font-bold text-red-600
                    transition-colors hover:bg-red-50
                  "
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}