import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  Ruler,
  Calendar,
  ShoppingBag,
  Edit3,
  Trash2,
  Copy,
  Check,
  Plus,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Scissors,
  X,
  FileText,
  Clock,
  Sparkles,
  Package,
} from "lucide-react";
import {
  getOneCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../../api/customerApi";
import { getOneCustomerOrders } from "../../../api/ordersApi";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("measurements"); // 'measurements' | 'orders'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedMeasurements, setCopiedMeasurements] = useState(false);

  // 1. Fetch Customer Data
  const {
    data: customerData,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getOneCustomer(id),
    enabled: !!id,
  });

  // 2. Fetch Customer Orders
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
  } = useQuery({
    queryKey: ["customer-orders", id],
    queryFn: () => getOneCustomerOrders(id),
    enabled: !!id,
  });

  const customer = customerData?.customer;
  const orders = ordersData?.orders || [];

  // Order statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, ord) => sum + (ord.price || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const cleanPhone = customer?.phoneNumber?.replace(/\D/g, "");

  // Copy phone number to clipboard
  const handleCopyPhone = () => {
    if (customer?.phoneNumber) {
      navigator.clipboard.writeText(customer.phoneNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Copy all measurements for tailoring note / WhatsApp
  const handleCopyMeasurements = () => {
    if (!customer?.measurements?.length) return;
    const text = customer.measurements
      .map((m) => `• ${m.label}: ${m.value}"`)
      .join("\n");
    const fullNote = `✂️ *Darzi Measurement Slip*\nClient: ${customer.name}\nPhone: ${customer.phoneNumber}\n---\n*Measurements:*\n${text}\n---\nRecorded on Darzi Studio`;
    navigator.clipboard.writeText(fullNote);
    setCopiedMeasurements(true);
    setTimeout(() => setCopiedMeasurements(false), 2000);
  };

  if (isCustomerLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#78716C]">
        <Loader2 size={38} className="animate-spin text-[#A66324]" />
        <p className="mt-3 text-sm font-bold text-[#1C1917]">
          Opening Client Ledger...
        </p>
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle size={32} />
        </div>
        <h2
          className="mt-4 text-2xl font-bold text-[#1C1917]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Customer Not Found
        </h2>
        <p className="mt-2 text-sm text-[#78716C]">
          {customerError?.message ||
            "The customer file you requested does not exist or may have been deleted."}
        </p>
        <Link
          to="/customers"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-5 py-3 text-sm font-bold text-white shadow-md transition"
        >
          <ArrowLeft size={16} />
          Return to Customer Ledger
        </Link>
      </div>
    );
  }

  const initials = (customer.name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78716C] hover:text-[#1C1917] transition"
        >
          <ArrowLeft size={15} />
          Back to All Clients
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5CDC0] bg-white px-4 py-2 text-xs font-bold text-[#1C1917] shadow-xs hover:bg-[#FAF7F2] transition"
          >
            <Edit3 size={14} className="text-[#A66324]" />
            Edit Profile
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Hero Artisan Client Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E5DFD3] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5 sm:items-center">
            {/* Leather Monogram Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#241711] to-[#3B2417] text-2xl font-bold text-[#E7D8CC] shadow-md border border-[#523522]">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1
                  className="text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {customer.name || "Unnamed Customer"}
                </h1>
                <span className="font-mono text-xs font-bold bg-[#FAF7F2] text-[#78716C] px-2.5 py-1 rounded-md border border-[#E5DFD3]">
                  CLIENT #{customer._id.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* Phone & Date Strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#78716C] pt-1">
                <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5DFD3]">
                  <Phone size={14} className="text-[#A66324]" />
                  <a
                    href={`tel:${customer.phoneNumber}`}
                    className="text-[#1C1917] hover:text-[#A66324] transition font-bold"
                  >
                    {customer.phoneNumber}
                  </a>
                  <button
                    onClick={handleCopyPhone}
                    className="text-[#78716C] hover:text-[#1C1917] transition ml-1"
                    title="Copy phone"
                  >
                    {isCopied ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>

                {cleanPhone && (
                  <a
                    href={`https://wa.me/92${cleanPhone.replace(/^0/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366]/10 px-3 py-1.5 text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/20 transition border border-[#25D366]/20"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#78716C]" />
                  <span>
                    Registered:{" "}
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-5 py-3 text-xs font-bold text-white shadow-md transition"
            >
              <Plus size={16} />
              <span>Create New Order</span>
            </Link>
          </div>
        </div>

        {/* Studio Ledger Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3.5 border-t border-[#EDE8DE] pt-6 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF7F2] p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Total Orders Placed
            </span>
            <p className="mt-1 text-2xl font-black text-[#1C1917]">{totalOrders}</p>
          </div>

          <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF7F2] p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Total Billing
            </span>
            <p className="mt-1 text-2xl font-black text-[#1C1917]">
              Rs. {totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Active / In Progress
            </span>
            <p className="mt-1 text-2xl font-black text-amber-800">{pendingOrders}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Completed Orders
            </span>
            <p className="mt-1 text-2xl font-black text-emerald-800">{deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-1">
        <button
          onClick={() => setActiveTab("measurements")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "measurements"
              ? "bg-[#3B2417] text-white shadow-sm"
              : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2]"
          }`}
        >
          <Ruler size={16} />
          <span>Measurement Sheet ({customer.measurements?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "orders"
              ? "bg-[#3B2417] text-white shadow-sm"
              : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2]"
          }`}
        >
          <ShoppingBag size={16} />
          <span>Order History ({totalOrders})</span>
        </button>
      </div>

      {/* TAB 1: MEASUREMENTS NOTEBOOK */}
      {activeTab === "measurements" && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="text-xl font-bold text-[#1C1917]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Tailoring Measurements Book
              </h2>
              <p className="text-xs text-[#78716C]">
                All size specifications recorded for this client.
              </p>
            </div>

            {customer.measurements?.length > 0 && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopyMeasurements}
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#D5CDC0] px-4 py-2.5 text-xs font-bold text-[#1C1917] shadow-xs hover:bg-[#FAF7F2] transition"
                >
                  {copiedMeasurements ? (
                    <>
                      <Check size={15} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} className="text-[#A66324]" />
                      <span>Copy Measurements Note</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
                >
                  <Edit3 size={14} />
                  <span>Update Sheet</span>
                </button>
              </div>
            )}
          </div>

          {customer.measurements?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {customer.measurements.map((m, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-[#E5DFD3] bg-white p-5 shadow-sm transition hover:border-[#A66324]/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#78716C] truncate pr-1">
                      {m.label}
                    </span>
                    <Ruler
                      size={16}
                      className="text-[#A66324]/60 group-hover:text-[#A66324] transition"
                    />
                  </div>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-[#1C1917]">
                      {m.value}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                      inches
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D5CDC0] bg-white py-16 text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF7F2] text-[#A66324] border border-[#E5DFD3]">
                <Ruler size={28} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                No sizes recorded for {customer.name}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-[#78716C]">
                Record standard measurements (kameez length, chest, waist, teera) so you can rapidly generate orders.
              </p>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
              >
                <Plus size={16} />
                <span>Record Measurements</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDER HISTORY */}
      {activeTab === "orders" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-bold text-[#1C1917]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Client Order Book
              </h2>
              <p className="text-xs text-[#78716C]">
                Historical records and active jobs placed by {customer.name}.
              </p>
            </div>

            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D5CDC0] bg-white px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition shadow-xs"
            >
              <ExternalLink size={14} className="text-[#A66324]" />
              <span>All Orders Register</span>
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5DFD3] bg-white shadow-sm">
            {isOrdersLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#78716C]">
                <Loader2 size={32} className="animate-spin text-[#A66324]" />
                <p className="mt-2 text-xs font-semibold">Pulling order slips...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF7F2] text-[#A66324] border border-[#E5DFD3]">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="mt-4 text-base font-bold text-[#1C1917]">
                  No orders recorded yet
                </h4>
                <p className="mt-1 text-xs text-[#78716C] max-w-sm">
                  This client hasn't placed any stitching orders yet. You can create an order using their saved measurements.
                </p>
                <Link
                  to="/dashboard/orders"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
                >
                  <Plus size={16} />
                  <span>Create First Order</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#EDE8DE]">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-[#FAF7F2] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-extrabold text-[#1C1917]">
                          ORDER #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      <p className="text-xs text-[#78716C] flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>
                          Booked on{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recently"}
                        </span>
                      </p>

                      {order.measurements?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {order.measurements.slice(0, 4).map((m, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-bold text-[#78716C] border border-[#E5DFD3]"
                            >
                              {m.label}: {m.value}"
                            </span>
                          ))}
                          {order.measurements.length > 4 && (
                            <span className="text-[10px] font-bold text-[#A66324] self-center">
                              +{order.measurements.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                      <span className="text-lg font-black text-[#1C1917]">
                        Rs. {order.price?.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-[#A66324] inline-flex items-center gap-1">
                        <span>Inspect Slip</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            queryClient.invalidateQueries(["customer", id]);
            queryClient.invalidateQueries(["customers"]);
          }}
        />
      )}

      {/* Delete Customer Modal */}
      {isDeleteModalOpen && (
        <DeleteCustomerModal
          customer={customer}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            queryClient.invalidateQueries(["customers"]);
            navigate("/customers");
          }}
        />
      )}
    </div>
  );
}

// Order Status Badge Component with Rich Craft Palette
function OrderStatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100/80 text-amber-900 border-amber-300",
    ready: "bg-blue-100/80 text-blue-900 border-blue-300",
    delivered: "bg-emerald-100/80 text-emerald-900 border-emerald-300",
  };

  const labels = {
    pending: "In Sewing / Pending",
    ready: "Ready for Pickup",
    delivered: "Completed & Delivered",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-300"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// Solid High-Contrast Edit Customer Modal
function EditCustomerModal({ customer, onClose, onSuccess }) {
  const [name, setName] = useState(customer.name || "");
  const [phoneNumber, setPhoneNumber] = useState(customer.phoneNumber || "");
  const [measurements, setMeasurements] = useState(
    customer.measurements?.length > 0
      ? customer.measurements.map((m) => ({ label: m.label, value: m.value }))
      : [
          { label: "Length (لمبائی)", value: "" },
          { label: "Chest (چھاتی)", value: "" },
          { label: "Waist (کمر)", value: "" },
          { label: "Shoulder / Teera (تیرا)", value: "" },
        ]
  );
  const [customLabel, setCustomLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: (payload) => updateCustomer(customer._id, payload),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update customer details."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = name.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName) {
      setErrorMsg("Name cannot be empty.");
      return;
    }

    if (!trimmedPhone) {
      setErrorMsg("Phone number cannot be empty.");
      return;
    }

    const validMeasurements = measurements
      .filter((m) => m.label.trim() && m.value.trim())
      .map((m) => ({
        label: m.label.trim(),
        value: m.value.trim(),
      }));

    handleUpdate({
      name: trimmedName,
      phoneNumber: trimmedPhone,
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
    setMeasurements((prev) => [...prev, { label: customLabel.trim(), value: "" }]);
    setCustomLabel("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-[#E5DFD3] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5DFD3] px-6 py-5 bg-[#FAF7F2]">
          <div>
            <h3
              className="text-xl font-bold text-[#1C1917]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Update Client Register<span className="text-[#A66324]">.</span>
            </h3>
            <p className="text-xs text-[#78716C] font-medium">
              Modify contact info and tailoring measurements
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#78716C] hover:bg-[#E5DFD3]/60 hover:text-[#1C1917] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 bg-white">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF7F2] p-4.5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1C1917] outline-none transition focus:border-[#A66324] focus:ring-2 focus:ring-[#A66324]/20 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1C1917] outline-none transition focus:border-[#A66324] focus:ring-2 focus:ring-[#A66324]/20 shadow-xs"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF7F2] p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Measurements Sheet (Inches)
              </h4>
              <span className="text-[11px] font-semibold text-[#78716C]">
                {measurements.length} sizes recorded
              </span>
            </div>

            <div className="space-y-2">
              {measurements.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-white p-2 border border-[#E5DFD3]"
                >
                  <span className="w-1/2 text-xs font-bold text-[#1C1917] truncate pl-1">
                    {m.label}
                  </span>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      placeholder="e.g. 40"
                      value={m.value}
                      onChange={(e) => handleMeasurementChange(idx, e.target.value)}
                      className="w-full rounded-lg border border-[#D5CDC0] bg-[#FAF7F2] px-3 py-1.5 pr-8 text-xs font-bold text-[#1C1917] outline-none focus:border-[#A66324] focus:bg-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#78716C] pointer-events-none">
                      in
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeasurement(idx)}
                    className="p-1.5 text-[#78716C] hover:text-red-600 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom measurement */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom size point..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomField();
                  }
                }}
                className="flex-1 rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] outline-none focus:border-[#A66324]"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition shadow-2xs"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="border-t border-[#E5DFD3] pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#D5CDC0] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>{isPending ? "Updating Register..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// High-Contrast Delete Confirmation Modal
function DeleteCustomerModal({ customer, onClose, onSuccess }) {
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: () => deleteCustomer(customer._id),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to delete customer. Make sure you have permission."
      );
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-red-200 bg-white p-7 shadow-2xl space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Trash2 size={28} />
        </div>

        <div>
          <h3
            className="text-xl font-bold text-[#1C1917]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Remove Client from Ledger?
          </h3>
          <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[#1C1917]">{customer.name}</span>? This
            will permanently wipe their profile and saved measurements from your shop directory.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#D5CDC0] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition"
          >
            Keep Client
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDelete()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            <span>{isPending ? "Removing..." : "Yes, Delete Record"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
