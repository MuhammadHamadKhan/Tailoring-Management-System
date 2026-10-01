import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { registerApi } from "../../api/authApi";
import authStore from "../../store/store";
import { Link, Navigate } from "react-router-dom";

// Decorative tick strip — evokes a tailor's measuring tape.
// Purely visual; aria-hidden so screen readers skip it.
function TapeStrip({ vertical = false }) {
  const ticks = Array.from({ length: 28 });
  return (
    <div
      aria-hidden="true"
      className={
        vertical
          ? "flex flex-col justify-between h-full py-1"
          : "flex justify-between w-full px-1"
      }
    >
      {ticks.map((_, i) => (
        <span
          key={i}
          className={
            vertical
              ? `block w-full ${i % 7 === 0 ? "h-[2px]" : "h-px"} bg-[#8C5F1F]/40`
              : `block h-full ${i % 7 === 0 ? "w-[2px]" : "w-px"} bg-[#8C5F1F]/40`
          }
        />
      ))}
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2C11 5.1 11.5 5 12 5c6.5 0 10 7 10 7a15.7 15.7 0 0 1-3.4 4.3M6.2 6.7A15.6 15.6 0 0 0 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

const FIELD_DEFS = [
  {
    name: "shopName",
    label: "Shop name",
    placeholder: "Khan Tailors",
    type: "text",
  },
  {
    name: "ownerName",
    label: "Owner name",
    placeholder: "Hamad Khan",
    type: "text",
  },
  {
    name: "phoneNumber",
    label: "Phone number",
    placeholder: "0301 2345678",
    type: "tel",
  },
  { name: "email", label: "Email", placeholder: "you@shop.com", type: "email" },
  {
    name: "address",
    label: "Shop address",
    placeholder: "Main Bazaar, Peshawar",
    type: "text",
  },
];

export default function RegisterPage() {
  const isLogin = authStore((state) => state.isLogin);

  if (isLogin) {
    return <Navigate to="/" replace />;
  }

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phoneNumber: "",
    email: "",
    password: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const { mutate, data, isSuccess, error, isError, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: registerApi,
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("clicked");

    mutate(form);
  };
  const inputClass =
    "w-full bg-white text-[#221F1A] placeholder-[#221F1A]/35 border border-[#E5E0D2] rounded-md px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[#A9762C] focus:ring-1 focus:ring-[#A9762C]";
  const labelClass = "block text-[13px] font-medium text-[#221F1A]/70 mb-1.5";

  return (
    <div className="min-h-screen bg-[#F6F3EC] md:flex">
      {/* Brand panel — hidden on mobile, shown from md up */}
      <div className="hidden md:flex md:w-[38%] lg:w-[34%] bg-[#221F1A] text-[#F6F3EC] flex-col justify-between p-10">
        <div>
          <p
            className="text-2xl leading-none"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Darzi<span className="text-[#C89550]">.</span>
          </p>
          <p className="text-sm text-[#F6F3EC]/60 mt-1">
            Order book, on your phone.
          </p>
        </div>

        <div className="h-24">
          <TapeStrip vertical />
        </div>

        <p className="text-sm text-[#F6F3EC]/60 max-w-[26ch]">
          Every customer's measurements, every order's status, kept where the
          whole shop can reach them.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile-only brand header */}
        <div className="md:hidden px-5 pt-8 pb-2">
          <p
            className="text-xl leading-none text-[#221F1A]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Darzi<span className="text-[#A9762C]">.</span>
          </p>
        </div>

        <div className="h-3 md:hidden">
          <TapeStrip />
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-8 md:py-10">
          {isSuccess ? (
            <Alert type="success" title="Success">
              {data?.message || "Shop Registered Successfully"}
            </Alert>
          ) : (
            <div className="w-full max-w-[380px]">
              <h1
                className="text-[28px] leading-tight text-[#221F1A] mb-1"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Set up your shop
              </h1>
              <p className="text-[15px] text-[#221F1A]/55 mb-7">
                Takes about a minute. You can edit anything later.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {FIELD_DEFS.map((field) => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className={labelClass}>
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputClass} pr-11`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#221F1A]/45 hover:text-[#221F1A]/70"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="cursor-pointer w-full mt-2 bg-[#A9762C] hover:bg-[#8C5F1F] text-white font-medium text-[15px] rounded-md py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Creating account…" : "Create account"}
                </button>
                {isError && (
                  <Alert type="error" className="mb-5">
                    {error.response?.data?.message ||
                      "Something went wrong. Please try again."}
                  </Alert>
                )}
              </form>

              <p className="text-center text-[14px] text-[#221F1A]/55 mt-6">
                Already set up?{" "}
                <Link to="/login" className="text-[#A9762C] font-medium">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
