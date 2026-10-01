import React from "react";

// Reusable alert card for success / error messages.
// Usage:
//   <Alert type="error">{errorMsg}</Alert>
//   <Alert type="success" title="Account created">Redirecting you to login…</Alert>
//   <Alert type="error" className="mb-4">Invalid phone number</Alert>

const TYPE_CONFIG = {
  error: {
    wrap: "text-[#B23A34] bg-[#B23A34]/8 border border-[#B23A34]/25",
    iconColor: "text-[#B23A34]",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  success: {
    wrap: "text-[#2F6B3A] bg-[#2F6B3A]/8 border border-[#2F6B3A]/25",
    iconColor: "text-[#2F6B3A]",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.5 2.5L16 9.5" />
      </svg>
    ),
  },
};

export function Alert({ type = "error", title, children, className = "" }) {
  if (!children && !title) return null;

  const config = TYPE_CONFIG[type];

  return (
    <div
      className={`flex gap-3 rounded-lg px-4 py-3 ${config.wrap} ${className}`}
    >
      <span className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        {config.icon}
      </span>
      <div className="min-w-0">
        {title && <p className="text-sm font-medium leading-snug">{title}</p>}
        {children && (
          <p
            className={`text-sm leading-snug ${title ? "opacity-80 mt-0.5" : ""}`}
          >
            {children}
          </p>
        )}
      </div>
    </div>
  );
}
