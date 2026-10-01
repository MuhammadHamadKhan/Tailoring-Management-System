import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  ShoppingBag,
  Clock,
  CheckCircle,
  PackageCheck,
  ChevronRight,
  User,
  Calendar,
  Phone,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../../../api/ordersApi";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 9;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", page, search, status],
    queryFn: () =>
      getAllOrders({
        page,
        limit,
        search,
        status,
      }),
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E3DA] pb-5">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Stitching Orders<span className="text-[#5A3825]">.</span>
          </h1>
          <p className="mt-1 text-xs text-[#736B63] font-medium sm:text-sm">
            Track client tailoring orders, stitching progress, and delivery statuses.
          </p>
        </div>

        <Link
          to="/orders/create"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#3B2417] hover:bg-[#24140B] active:bg-[#1A0D07] px-5 py-3 text-xs font-bold text-white shadow-md transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Book New Order</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]"
            />
            <input
              type="text"
              placeholder="Search customer name or phone number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[#D8D1C5] bg-[#F9F7F4] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#1C1917] outline-none transition placeholder:text-[#736B63] focus:border-[#3B2417] focus:bg-white"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#D8D1C5] bg-[#F9F7F4] px-4 py-2.5 text-xs font-bold text-[#1C1917] outline-none transition focus:border-[#3B2417] focus:bg-white md:w-52"
            >
              <option value="">All Order Statuses</option>
              <option value="pending">In Sewing / Pending</option>
              <option value="ready">Ready for Pickup</option>
              <option value="delivered">Completed / Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid / Table */}
      <div className="rounded-3xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-bold text-[#736B63]">
            Loading stitching orders...
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-xs font-bold text-red-500">
            Failed to load orders. Please refresh the page.
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9F7F4] text-[#3B2417] border border-[#E8E3DA]">
              <ShoppingBag size={28} />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1C1917]">
              {search || status ? "No matching orders found" : "No orders booked yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[#736B63]">
              {search || status
                ? "Try clearing your filters or search keywords."
                : "Create your first customer stitching order with saved measurements."}
            </p>
            <Link
              to="/orders/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3B2417] hover:bg-[#24140B] px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
            >
              <Plus size={16} />
              <span>Book First Order</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E8E3DA] bg-[#F9F7F4] text-xs font-bold uppercase tracking-wider text-[#736B63]">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Booked</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DA]">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="group transition hover:bg-[#F9F7F4]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/orders/${order._id}`}
                          className="font-mono text-xs font-extrabold text-[#1C1917] hover:text-[#5A3825]"
                        >
                          #{order._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-[#1C1917]">
                            {order.customerId?.name || "Unnamed"}
                          </p>
                          <p className="text-[11px] text-[#736B63] font-medium">
                            {order.customerId?.phoneNumber || "No phone"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-[#736B63]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 font-black text-[#1C1917]">
                        Rs. {order.price?.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#3B2417] group-hover:translate-x-1 transition-transform"
                        >
                          <span>Open Slip</span>
                          <ChevronRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List */}
            <div className="divide-y divide-[#E8E3DA] md:hidden">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block p-4 transition hover:bg-[#F9F7F4]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-extrabold text-[#1C1917]">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#1C1917]">
                        {order.customerId?.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-[#736B63]">
                        {order.customerId?.phoneNumber}
                      </p>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E8E3DA] pt-2 text-xs">
                    <span className="font-black text-[#1C1917] text-sm">
                      Rs. {order.price}
                    </span>
                    <span className="text-[#736B63]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#E8E3DA] px-6 py-4">
                <p className="text-xs font-semibold text-[#736B63]">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Clean White & Brown / Refined Neutral Status Badges (No Yellowish tint)
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-[#F4EFEA] text-[#5A3825] border-[#E2D5CC]",
    ready: "bg-[#EEF2F6] text-[#1E3A8A] border-[#D0DBEA]",
    delivered: "bg-[#EFF8F2] text-[#166534] border-[#CCEBD6]",
  };

  const labels = {
    pending: "In Sewing / Pending",
    ready: "Ready for Pickup",
    delivered: "Delivered",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
