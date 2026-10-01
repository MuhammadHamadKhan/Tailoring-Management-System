import React from "react";

// Main button — primary amber, used for the main action on a screen
export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-primary text-white font-medium px-4 py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Outlined button — for secondary actions like Cancel
export function OutlineButton({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-surface text-heading font-medium px-4 py-3 rounded-xl border border-border hover:bg-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Danger button — for delete actions
export function DangerButton({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-red-600 text-white font-medium px-4 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
