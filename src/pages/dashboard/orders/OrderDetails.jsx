import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  Ruler,
  Calendar,
  CheckCircle,
  Clock,
  PackageCheck,
  AlertCircle,
  Loader2,
  Trash2,
  Copy,
  Check,
  Printer,
  MessageCircle,
  Scissors,
  DollarSign,
  User,
  ShoppingBag,
} from "lucide-react";
import { getOneOrder, updateOrder, deleteOrder } from "../../../api/ordersApi";
import authStore from "../../../store/store";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { shop } = authStore()
  // Fetch Order
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOneOrder(id),
    enabled: !!id,
  });

  const order = data?.order;
  const customer = order?.customerId;

  // Status Update Mutation
  const { mutate: handleStatusChange, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (newStatus) => updateOrder(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboard-summary"]);
    },
  });

  // Delete Order Mutation
  const { mutate: handleDeleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboard-summary"]);
      navigate("/orders");
    },
  });

  const cleanPhone = customer?.phoneNumber?.replace(/\D/g, "");

  const [isPhoneCopied, setIsPhoneCopied] = useState(false);

  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const handleCallClick = (e) => {
    // On desktop, tel: links don't do anything useful — so we intercept the click
    if (!isMobileDevice()) {
      e.preventDefault(); // stop the browser from trying (and failing) to open a dialer

      navigator.clipboard.writeText(customer.phoneNumber);
      setIsPhoneCopied(true);
      setTimeout(() => setIsPhoneCopied(false), 2000);
    }
    // On mobile, we do nothing here — let the tel: link work normally
  };

  const handlePrintReceipt = () => {
    if (!order) return;

    const measurementRows = (order.measurements || [])
      .map(
        (m) => `
      <tr>
        <td>${m.label}</td>
        <td style="text-align:right;">${m.value}"</td>
      </tr>`
      )
      .join("");

    // Only show WhatsApp as a separate line if it's different from the main phone number
    const contactRows =
      shop?.whatsappNumber && shop.whatsappNumber !== shop?.phoneNumber
        ? `
        <tr><td class="label">Phone</td><td class="value">${shop?.phoneNumber || "—"}</td></tr>
        <tr><td class="label">WhatsApp</td><td class="value">${shop.whatsappNumber}</td></tr>`
        : `
        <tr><td class="label">Phone</td><td class="value">${shop?.phoneNumber || "—"}</td></tr>`;

    const currency = shop?.currencySymbol || "Rs.";

    const receiptHTML = `
  <html>
    <head>
      <title>Order #${order._id.slice(-6).toUpperCase()}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          width: 320px;
          margin: 0 auto;
          padding: 16px;
          color: #111;
          font-size: 13px;
        }
        .center { text-align: center; }
        .shop-name { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
        .tagline { font-size: 11px; color: #555; margin-top: 2px; }
        hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 3px 0; vertical-align: top; }
        .label { color: #444; }
        .value { font-weight: bold; text-align: right; }
        .section-title {
          font-weight: bold; text-transform: uppercase;
          font-size: 11px; letter-spacing: 0.5px; margin-top: 4px;
        }
        .status-badge {
          display: inline-block; border: 1px solid #111; padding: 2px 8px;
          font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 4px;
        }
        .price-box { text-align: center; margin: 10px 0; }
        .price-box .amount { font-size: 22px; font-weight: bold; }
        .footer { margin-top: 14px; font-size: 11px; color: #555; text-align: center; }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="shop-name">${(shop?.shopName || "DARZI TAILORING").toUpperCase()}</div>
        <div class="tagline">Stitching Order Receipt</div>
      </div>

      <hr />

      <table>
        <tr><td class="label">Order ID</td><td class="value">#${order._id.slice(-6).toUpperCase()}</td></tr>
        <tr><td class="label">Date</td><td class="value">${new Date(order.createdAt).toLocaleDateString()}</td></tr>
      </table>

      <div class="center"><span class="status-badge">${order.status}</span></div>

      <hr />

      <div class="section-title">Customer</div>
      <table>
        <tr><td class="label">Name</td><td class="value">${customer?.name || "Unnamed"}</td></tr>
        <tr><td class="label">Phone</td><td class="value">${customer?.phoneNumber || "—"}</td></tr>
      </table>

      <hr />

      <div class="section-title">Measurements</div>
      <table>
        ${measurementRows || `<tr><td colspan="2">No measurements recorded</td></tr>`}
      </table>

      <hr />

      <div class="price-box">
        <div class="label">Total Stitching Price</div>
        <div class="amount">${currency} ${order.price?.toLocaleString()}</div>
      </div>

      <hr />

      <div class="section-title">Contact Us</div>
      <table>
        ${contactRows}
      </table>

      <hr />

      <div class="footer">
        Thank you for trusting us with your stitching.<br />
        Please bring this slip when collecting your order.
        ${shop?.receiptFooterMessage ? `<br /><br />${shop.receiptFooterMessage}` : ""}
      </div>
    </body>
  </html>
`;

    // Create a hidden iframe instead of a popup window — avoids popup blockers entirely
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(receiptHTML);
    doc.close();

    // give the iframe a moment to render before printing
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // clean up the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };
  const handleCopyOrderSlip = () => {
    if (!order) return;

    const measurementLines = (order.measurements || [])
      .map((m) => `• ${m.label}: ${m.value}"`)
      .join("\n");

    // Only show WhatsApp as a separate line if it's different from the main phone number
    const contactLines =
      shop?.whatsappNumber && shop.whatsappNumber !== shop?.phoneNumber
        ? `Phone: ${shop?.phoneNumber || "—"}\nWhatsApp: ${shop.whatsappNumber}`
        : `Phone: ${shop?.phoneNumber || "—"}`;

    const slip = `🧵 *${(shop?.shopName || "DARZI").toUpperCase()} STITCHING ORDER SLIP*
Order ID: #${order._id.slice(-6).toUpperCase()}
Client: ${customer?.name || "Unnamed"}
Client Phone: ${customer?.phoneNumber || "—"}
Status: ${order.status.toUpperCase()}
Price: ${shop?.currencySymbol || "Rs."} ${order.price}
Date: ${new Date(order.createdAt).toLocaleDateString()}
---
*Measurements:*
${measurementLines}
---
${shop?.shopName || "Darzi Tailoring Management"}
${contactLines}${shop?.receiptFooterMessage ? `\n\n${shop.receiptFooterMessage}` : ""}`;

    navigator.clipboard.writeText(slip);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#736B63]">
        <Loader2 size={36} className="animate-spin text-[#3B2417]" />
        <p className="mt-3 text-sm font-bold text-[#1C1917]">
          Loading order details...
        </p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle size={30} />
        </div>
        <h2
          className="mt-4 text-2xl font-bold text-[#1C1917]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Order Not Found
        </h2>
        <p className="mt-1 text-xs text-[#736B63]">
          {error?.message || "This order record does not exist or may have been deleted."}
        </p>
        <Link
          to="/orders"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3B2417] px-4 py-2.5 text-xs font-bold text-white"
        >
          <ArrowLeft size={16} />
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-7 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E3DA] pb-5">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#736B63] hover:text-[#1C1917] transition"
        >
          <ArrowLeft size={15} />
          Back to Orders Register
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyOrderSlip}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] transition shadow-2xs"
          >
            {isCopied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-600">Slip Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-[#3B2417]" />
                <span>Copy Order Slip</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrintReceipt}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] transition shadow-2xs"
          >
            <Printer size={14} className="text-[#3B2417]" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            <Trash2 size={14} />
            <span>Delete Order</span>
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="rounded-3xl border border-[#E8E3DA] bg-white p-6 shadow-sm sm:p-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E3DA] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-black text-[#1C1917] sm:text-3xl"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                ORDER #{order._id.slice(-6).toUpperCase()}
              </h1>
              <OrderStatusPill status={order.status} />
            </div>
            <p className="text-xs text-[#736B63] flex items-center gap-1.5 font-medium">
              <Calendar size={13} />
              <span>
                Booked on{" "}
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          {/* Status Quick Switcher */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#736B63]">
              Update Status:
            </span>
            <div className="flex items-center rounded-xl bg-[#F9F7F4] p-1 border border-[#E8E3DA]">
              {["pending", "ready", "delivered"].map((st) => (
                <button
                  key={st}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${order.status === st
                    ? "bg-[#3B2417] text-white shadow-xs"
                    : "text-[#736B63] hover:text-[#1C1917]"
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Client & Price Info Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Client Details Box */}
          <div className="rounded-2xl border border-[#E8E3DA] bg-[#F9F7F4] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#736B63]">
                Customer Information
              </span>
              {customer?._id && (
                <Link
                  to={`/customers/${customer._id}`}
                  className="text-xs font-bold text-[#3B2417] hover:underline"
                >
                  View Profile →
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#3B2417] text-white font-bold text-sm">
                {customer?.name?.slice(0, 2).toUpperCase() || "CL"}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">
                  {customer?.name || "Unnamed Customer"}
                </h3>
                <p className="text-xs text-[#736B63] font-medium">
                  {customer?.phoneNumber || "No phone on record"}
                </p>
              </div>
            </div>

            {/* Quick Contact Links */}
            <div className="flex items-center gap-2 pt-2">
              {customer?.phoneNumber && (

                <a
                  href={`tel:${customer.phoneNumber}`}
                  onClick={handleCallClick}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D1C5] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#F4EFEA] transition shadow-2xs"
                >
                  {isPhoneCopied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">Number Copied!</span>
                    </>
                  ) : (
                    <>
                      <Phone size={13} className="text-[#3B2417]" />
                      <span>Call Client</span>
                    </>
                  )}
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`https://wa.me/92${cleanPhone.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366]/10 px-3 py-1.5 text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/20 transition border border-[#25D366]/20"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl border border-[#E8E3DA] bg-[#F9F7F4] p-5 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#736B63]">
              Financial Summary
            </span>

            <div className="py-2">
              <span className="text-xs font-semibold text-[#736B63]">
                Agreed Stitching Price:
              </span>
              <p className="text-3xl font-black text-[#1C1917] mt-0.5">
                Rs. {order.price?.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#E8E3DA] pt-3 text-xs text-[#736B63]">
              <span>Payment status: Recorded</span>
              <span className="font-semibold text-[#3B2417]">Currency: PKR</span>
            </div>
          </div>
        </div>

        {/* Measurements Used for this Order */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[#3B2417]" />
              <h2
                className="text-lg font-bold text-[#1C1917]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Measurements Sheet Used for this Order
              </h2>
            </div>
            <span className="text-xs font-bold text-[#736B63]">
              {order.measurements?.length || 0} size dimensions
            </span>
          </div>

          {order.measurements && order.measurements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {order.measurements.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E8E3DA] bg-[#F9F7F4] p-4 flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-[#736B63] truncate">
                    {m.label}
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#1C1917]">
                      {m.value}
                    </span>
                    <span className="text-xs font-bold uppercase text-[#736B63]">
                      in
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E8E3DA] p-8 text-center text-xs text-[#736B63]">
              No custom measurements recorded for this order slip.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {
        isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/75 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border-2 border-red-200 bg-white p-7 shadow-2xl space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={26} />
              </div>

              <div>
                <h3
                  className="text-xl font-bold text-[#1C1917]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Delete Stitching Order?
                </h3>
                <p className="mt-2 text-xs text-[#736B63] leading-relaxed">
                  Are you sure you want to permanently delete order{" "}
                  <span className="font-bold text-[#1C1917]">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-xl border border-[#D8D1C5] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDeleteOrder()}
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Order"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function OrderStatusPill({ status }) {
  const styles = {
    pending: "bg-[#F4EFEA] text-[#5A3825] border-[#E2D5CC]",
    ready: "bg-[#EEF2F6] text-[#1E3A8A] border-[#D0DBEA]",
    delivered: "bg-[#EFF8F2] text-[#166534] border-[#CCEBD6]",
  };

  const labels = {
    pending: "Pending / Sewing",
    ready: "Ready for Pickup",
    delivered: "Delivered",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
    >
      {labels[status] || status}
    </span>
  );
}
