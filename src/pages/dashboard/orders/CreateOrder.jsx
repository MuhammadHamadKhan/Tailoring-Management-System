import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Ruler,
  DollarSign,
  Scissors,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  UserCheck,
  UserPlus,
  ShoppingBag,
  Info,
} from "lucide-react";
import { getAll, createCustomer } from "../../../api/customerApi";
import { createOrder } from "../../../api/ordersApi";

const DEFAULT_MEASUREMENT_PRESETS = [
  { label: "Length (لمبائی)", value: "" },
  { label: "Chest (چھاتی)", value: "" },
  { label: "Waist (کمر)", value: "" },
  { label: "Shoulder / Teera (تیرا)", value: "" },
  { label: "Sleeves (بازو)", value: "" },
  { label: "Collar (گلا)", value: "" },
  { label: "Daman (دامن)", value: "" },
  { label: "Shalwar / Trouser (شلوار)", value: "" },
  { label: "Paincha (پانچہ)", value: "" },
];

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const preselectedCustomerId = searchParams.get("customerId");

  // State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [price, setPrice] = useState("");
  const [measurements, setMeasurements] = useState([
    { label: "Length (لمبائی)", value: "" },
    { label: "Chest (چھاتی)", value: "" },
    { label: "Waist (کمر)", value: "" },
    { label: "Shoulder / Teera (تیرا)", value: "" },
    { label: "Sleeves (بازو)", value: "" },
  ]);
  const [customLabel, setCustomLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Quick Customer Creation modal/drawer state
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickError, setQuickError] = useState("");
  const [quickMeasurements, setQuickMeasurements] = useState([
    { label: "Length", value: "" },
    { label: "Chest", value: "" },
    { label: "Shoulder", value: "" },
  ]);
  // Fetch all customers for customer picker
  const { data: customersData, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getAll,
  });

  const customers = customersData?.customers || [];

  // If customerId was in URL params, pre-select that customer
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0 && !selectedCustomer) {
      const found = customers.find((c) => c._id === preselectedCustomerId);
      if (found) {
        handleSelectCustomer(found);
      }
    }
  }, [preselectedCustomerId, customers]);

  // When customer is selected, load their measurements into the order
  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    if (cust.measurements && cust.measurements.length > 0) {
      setMeasurements(
        cust.measurements.map((m) => ({ label: m.label, value: m.value })),
      );
    } else {
      setMeasurements([
        { label: "Length (لمبائی)", value: "" },
        { label: "Chest (چھاتی)", value: "" },
        { label: "Waist (کمر)", value: "" },
        { label: "Shoulder / Teera (تیرا)", value: "" },
        { label: "Sleeves (بازو)", value: "" },
      ]);
    }
  };

  // Quick Customer Add Mutation
  const { mutate: handleQuickAdd, isPending: isAddingCustomer } = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["customers"]);
      setShowQuickAddCustomer(false);
      setQuickName("");
      setQuickPhone("");
      if (data?.customer) {
        handleSelectCustomer(data.customer);
      }
    },
    onError: (err) => {
      setQuickError(
        err?.response?.data?.message || "Failed to create quick customer.",
      );
    },
  });

  const submitQuickCustomer = () => {
    setQuickError("");

    const trimmedName = quickName.trim();
    const trimmedPhone = quickPhone.trim();

    if (!trimmedName) {
      setQuickError("Customer name is required.");
      return;
    }

    if (!/^03\d{9}$/.test(trimmedPhone)) {
      setQuickError("Enter a valid phone number, e.g. 03001234567.");
      return;
    }

    // Filter out empty measurement fields — same pattern as your main AddCustomerModal
    const validMeasurements = quickMeasurements
      .filter((m) => m.label.trim() && m.value.trim())
      .map((m) => ({
        label: m.label.trim(),
        value: m.value.trim(),
      }));

    if (validMeasurements.length < 3) {
      setQuickError("Please enter at least three measurement before saving.");
      return;
    }

    // ...now call your actual mutation, passing validMeasurements
    handleQuickAdd({
      name: trimmedName,
      phoneNumber: trimmedPhone,
      measurements: validMeasurements,
    });
  };

  // Create Order Mutation
  const { mutate: handleCreateOrder, isPending: isSubmitting } = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboard-summary"]);
      if (selectedCustomer?._id) {
        queryClient.invalidateQueries([
          "customer-orders",
          selectedCustomer._id,
        ]);
      }
      navigate("/orders");
    },
    onError: (err) => {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to create order. Please check all fields.",
      );
    },
  });

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedCustomer) {
      setErrorMsg("Please select or add a customer for this order.");
      return;
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg("Please enter a valid order price in PKR (e.g. 2500).");
      return;
    }

    const validMeasurements = measurements
      .filter((m) => m.label.trim() && m.value.trim())
      .map((m) => ({
        label: m.label.trim(),
        value: m.value.trim(),
      }));

    if (validMeasurements.length === 0) {
      setErrorMsg(
        "Please provide at least one measurement for this order (e.g. Length or Chest).",
      );
      return;
    }

    handleCreateOrder({
      customerId: selectedCustomer._id,
      price: numPrice,
      measurements: validMeasurements,
    });
  };

  const handleMeasurementChange = (index, value) => {
    setMeasurements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handleRemoveMeasurement = (index) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomField = () => {
    if (!customLabel.trim()) return;
    setMeasurements((prev) => [
      ...prev,
      { label: customLabel.trim(), value: "" },
    ]);
    setCustomLabel("");
  };

  const handleAddPreset = (presetLabel) => {
    if (measurements.some((m) => m.label === presetLabel)) return;
    setMeasurements((prev) => [...prev, { label: presetLabel, value: "" }]);
  };

  // Filtered customer list for picker
  const filteredPickCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phoneNumber?.includes(customerSearch),
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-7 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E3DA] pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E3DA] bg-white text-[#736B63] hover:bg-[#F9F7F4] hover:text-[#1C1917] transition shadow-2xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Book New Stitching Order<span className="text-[#5A3825]">.</span>
            </h1>
            <p className="mt-0.5 text-xs text-[#736B63] font-medium sm:text-sm">
              Assign to customer, record sewing measurements, and set order
              price.
            </p>
          </div>
        </div>

        <Link
          to="/orders"
          className="text-xs font-bold text-[#5A3825] hover:text-[#3B2417] transition self-start sm:self-auto"
        >
          Cancel & Return to Orders
        </Link>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200 shadow-xs">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Order Form Grid */}
      <form
        onSubmit={handleSubmitOrder}
        className="grid grid-cols-1 gap-7 lg:grid-cols-3"
      >
        {/* Left Column (2 Cols): Customer Selection & Measurements */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Customer Selection Card */}
          <div className="rounded-3xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B2417] text-white">
                  <Users size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">
                    1. Select Customer
                  </h3>
                  <p className="text-xs text-[#736B63]">
                    Who is this stitching order for?
                  </p>
                </div>
              </div>

              {!showQuickAddCustomer && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddCustomer(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E3DA] bg-[#F9F7F4] px-3 py-1.5 text-xs font-bold text-[#3B2417] hover:bg-white transition"
                >
                  <UserPlus size={14} />
                  <span>+ Quick Add Customer</span>
                </button>
              )}
            </div>

            {/* Quick Customer Add Inline Box */}
            {showQuickAddCustomer && (
              <div className="rounded-2xl border border-[#3B2417]/20 bg-[#F4EFEA] p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B2417] uppercase tracking-wider">
                    Add New Customer On The Spot
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCustomer(false)}
                    className="cursor-pointer text-xs text-[#736B63] hover:text-[#1C1917]"
                  >
                    Cancel
                  </button>
                </div>

                {quickError && (
                  <p className="text-xs font-semibold text-red-600">
                    {quickError}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Customer Full Name *"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1917] outline-none focus:border-[#3B2417]"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (0300...)*"
                    value={quickPhone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);
                      setQuickPhone(digitsOnly);
                    }}
                    className="rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1917] outline-none focus:border-[#3B2417]"
                  />
                </div>

                {/* Minimal measurement entry — at least one is required before saving */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-[#3B2417] uppercase tracking-wider">
                    Quick Measurements (at least one required)
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {quickMeasurements.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1/2 truncate text-[11px] font-bold text-[#1C1917]">
                          {m.label}
                        </span>
                        <div className="relative w-1/2">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="in"
                            value={m.value}
                            onChange={(e) => {
                              const sanitized = e.target.value.replace(
                                /[^0-9.]/g,
                                "",
                              );
                              setQuickMeasurements((prev) => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  value: sanitized,
                                };
                                return updated;
                              });
                            }}
                            className="w-full rounded-lg border border-[#D8D1C5] bg-white px-2 py-1 text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#3B2417]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAddingCustomer}
                  onClick={submitQuickCustomer}
                  className="cursor-pointer rounded-xl bg-[#3B2417] hover:bg-[#29180E] px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {isAddingCustomer ? "Registering..." : "Save & Select Client"}
                </button>
              </div>
            )}

            {/* If Customer is Selected */}
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-2xl border border-[#3B2417]/30 bg-[#F4EFEA] p-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B2417] text-white font-bold text-sm">
                    {selectedCustomer.name?.slice(0, 2).toUpperCase() || "CL"}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1C1917]">
                      {selectedCustomer.name}
                    </h4>
                    <p className="text-xs text-[#736B63] font-medium">
                      Phone:{" "}
                      <span className="text-[#1C1917] font-semibold">
                        {selectedCustomer.phoneNumber}
                      </span>
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-[#5A3825]">
                      ✓ {selectedCustomer.measurements?.length || 0} saved
                      measurements loaded
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="cursor-pointer rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-2 text-xs font-bold text-[#736B63] hover:text-[#1C1917] hover:bg-[#F9F7F4] transition shadow-2xs"
                >
                  Change Customer
                </button>
              </div>
            ) : (
              /* Searchable Customer Picker */
              <div className="space-y-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]"
                  />
                  <input
                    type="text"
                    placeholder="Search existing customers by name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full rounded-xl border border-[#D8D1C5] bg-[#F9F7F4] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#1C1917] outline-none transition focus:border-[#3B2417] focus:bg-white"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-[#E8E3DA] rounded-xl border border-[#E8E3DA] bg-white">
                  {isCustomersLoading ? (
                    <div className="p-4 text-center text-xs text-[#736B63]">
                      Loading customer book...
                    </div>
                  ) : filteredPickCustomers.length === 0 ? (
                    <div className="p-5 text-center text-xs text-[#736B63]">
                      No customers found. Click{" "}
                      <strong>+ Quick Add Customer</strong> above to register
                      them.
                    </div>
                  ) : (
                    filteredPickCustomers.slice(0, 8).map((cust) => (
                      <div
                        key={cust._id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="flex cursor-pointer items-center justify-between p-3 transition hover:bg-[#F4EFEA]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B2417] text-[11px] font-bold text-white">
                            {cust.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#1C1917]">
                              {cust.name}
                            </p>
                            <p className="text-[11px] text-[#736B63]">
                              {cust.phoneNumber}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-lg bg-[#F9F7F4] border border-[#E8E3DA] px-2.5 py-1 text-[11px] font-bold text-[#3B2417]">
                          Select Client →
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Measurements Sheet for this Order */}
          <div className="rounded-3xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B2417] text-white">
                  <Ruler size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">
                    2. Order Measurements Sheet
                  </h3>
                  <p className="text-xs text-[#736B63]">
                    Specify cutting & stitching dimensions in inches.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#736B63]">
                {measurements.filter((m) => m.value.trim()).length} sizes filled
              </span>
            </div>

            {/* Quick Add Presets */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#736B63] block mb-2">
                Quick Add Tailoring Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_MEASUREMENT_PRESETS.map((preset, idx) => {
                  const alreadyAdded = measurements.some(
                    (m) => m.label.toLowerCase() === preset.label.toLowerCase(),
                  );
                  if (alreadyAdded) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.label)}
                      className="cursor-pointer rounded-lg border border-[#D8D1C5] bg-[#F9F7F4] px-2.5 py-1 text-[11px] font-semibold text-[#1C1917] hover:border-[#3B2417] hover:bg-white transition"
                    >
                      + {preset.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Measurement Fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {measurements.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-2xl bg-[#F9F7F4] p-3 border border-[#E8E3DA]"
                >
                  <span className="w-1/2 text-xs font-bold text-[#1C1917] truncate">
                    {m.label}
                  </span>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      placeholder="e.g. 40"
                      value={m.value}
                      onChange={(e) =>
                        handleMeasurementChange(idx, e.target.value)
                      }
                      className="w-full rounded-xl border border-[#D8D1C5] bg-white px-3 py-1.5 pr-8 text-xs font-bold text-[#1C1917] outline-none focus:border-[#3B2417]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#736B63] pointer-events-none">
                      in
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeasurement(idx)}
                    className="cursor-pointer p-1.5 text-[#736B63] hover:text-red-600 transition"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom Measurement Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E3DA]">
              <input
                type="text"
                placeholder="Add other size (e.g. Cuff / کف, Gala / گلا)..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomField();
                  }
                }}
                className="flex-1 rounded-xl border border-[#D8D1C5] bg-[#F9F7F4] px-3.5 py-2 text-xs font-semibold text-[#1C1917] outline-none focus:border-[#3B2417] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="cursor-pointer rounded-xl border border-[#D8D1C5] bg-white px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] transition shadow-2xs"
              >
                + Add Size Field
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Pricing, Order Summary, & Confirm */}
        <div className="space-y-6">
          {/* Price & Billing Card */}
          <div className="rounded-3xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#E8E3DA] pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B2417] text-white">
                <DollarSign size={17} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">
                  3. Order Pricing
                </h3>
                <p className="text-xs text-[#736B63]">
                  Total stitching charge in PKR.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Stitching Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#736B63]">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  placeholder="e.g. 2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-2xl border border-[#D8D1C5] bg-[#F9F7F4] py-3 pl-11 pr-4 text-base font-black text-[#1C1917] outline-none transition focus:border-[#3B2417] focus:bg-white shadow-2xs"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#736B63]">
                Total payable amount agreed with customer
              </p>
            </div>
          </div>

          {/* Order Summary Confirmation Card */}
          <div className="rounded-3xl border-2 border-[#3B2417]/20 bg-[#F4EFEA] p-6 shadow-md space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A3825]">
                Order Slip Summary
              </span>
              <h4
                className="mt-1 text-xl font-bold text-[#1C1917]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Ready to Book
              </h4>
            </div>

            <div className="space-y-3 border-y border-[#3B2417]/15 py-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#736B63]">Customer:</span>
                <span className="font-bold text-[#1C1917]">
                  {selectedCustomer
                    ? selectedCustomer.name
                    : "Not selected yet"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#736B63]">Phone:</span>
                <span className="font-bold text-[#1C1917]">
                  {selectedCustomer ? selectedCustomer.phoneNumber : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#736B63]">Sizes Recorded:</span>
                <span className="font-bold text-[#1C1917]">
                  {measurements.filter((m) => m.value.trim()).length}{" "}
                  measurement points
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#736B63]">Initial Status:</span>
                <span className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#5A3825] border border-[#E8E3DA]">
                  Pending / In Sewing
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs font-bold text-[#736B63]">
                Total Price:
              </span>
              <span className="text-2xl font-black text-[#1C1917]">
                Rs. {price ? Number(price).toLocaleString() : "0"}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedCustomer || !price}
              className="cursor-pointer w-full rounded-2xl bg-[#3B2417] hover:bg-[#24140B] active:bg-[#1A0D07] py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Order Slip...</span>
                </>
              ) : (
                <>
                  <Scissors size={17} />
                  <span>Confirm & Save Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
