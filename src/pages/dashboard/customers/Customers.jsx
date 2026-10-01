import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Phone,
  Ruler,
  Calendar,
  ChevronRight,
  Grid,
  List,
  X,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  MessageCircle,
  Scissors,
  Bookmark,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { getAll, createCustomer } from "../../../api/customerApi";

// Pre-defined tailoring measurement presets common for traditional & western tailoring
const MEASUREMENT_PRESETS = [
  { label: "Length (لمبائی)", placeholder: "e.g. 40" },
  { label: "Chest (چھاتی)", placeholder: "e.g. 38" },
  { label: "Waist (کمر)", placeholder: "e.g. 34" },
  { label: "Shoulder / Teera (تیرا)", placeholder: "e.g. 18.5" },
  { label: "Sleeves (بازو)", placeholder: "e.g. 24" },
  { label: "Collar (گلا / کالر)", placeholder: "e.g. 16" },
  { label: "Daman (دامن / گھیرا)", placeholder: "e.g. 23" },
  { label: "Shalwar / Trouser (شلوار)", placeholder: "e.g. 39" },
  { label: "Paincha (پانچہ)", placeholder: "e.g. 8.5" },
  { label: "Inseam (آسن)", placeholder: "e.g. 15" },
];

export default function Customers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // default to rich visual card grid
  const [filterType, setFilterType] = useState("all"); // 'all' | 'has-measurements'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch all customers
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers"],
    queryFn: getAll,
  });

  const rawCustomers = data?.customers || [];

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...rawCustomers];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.phoneNumber?.toLowerCase().includes(q)
      );
    }

    // Filter by measurements
    if (filterType === "has-measurements") {
      result = result.filter((c) => c.measurements && c.measurements.length > 0);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      return 0;
    });

    return result;
  }, [rawCustomers, search, filterType, sortBy]);

  // Pagination calculation
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Stats
  const totalWithMeasurements = rawCustomers.filter(
    (c) => c.measurements && c.measurements.length > 0
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-10">
      {/* Bespoke Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#241711] via-[#332014] to-[#432A1C] p-6 text-[#F7F5F0] shadow-xl sm:p-8 border border-[#523522]">
        {/* Decorative Tape Graphic in background */}
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 pointer-events-none flex items-center justify-end pr-8">
          <Scissors size={180} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 mb-3">
              <Scissors size={13} />
              <span>Client Ledger & Size Register</span>
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight text-[#FAF7F2] sm:text-4xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Customer Directory<span className="text-[#C5A880]">.</span>
            </h1>
            <p className="mt-2 text-sm text-[#E7D8CC]/80 sm:text-base leading-relaxed">
              Keep customer measurements, phone contacts, and tailoring history organized in one central studio ledger.
            </p>
          </div>

          {/* Prominent High-Contrast Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-white hover:bg-[#F4EFEA] active:bg-[#E8E3DA] px-5 py-3.5 text-sm font-bold text-[#1C1917] shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Plus size={19} strokeWidth={2.5} className="text-[#3B2417]" />
              <span>+ Add New Customer</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 border-t border-[#523522]/80 pt-5 sm:grid-cols-3 md:w-fit md:gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E7D8CC]/60">
              Total Clients
            </span>
            <p className="text-2xl font-bold text-white mt-0.5">
              {isLoading ? "..." : rawCustomers.length}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E7D8CC]/60">
              Measurements On File
            </span>
            <p className="text-2xl font-bold text-[#E7D8CC] mt-0.5">
              {isLoading ? "..." : totalWithMeasurements}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E7D8CC]/60">
              Studio Readiness
            </span>
            <p className="text-2xl font-bold text-white mt-0.5">
              {rawCustomers.length > 0
                ? `${Math.round((totalWithMeasurements / rawCustomers.length) * 100)}%`
                : "100%"}
            </p>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]"
            />
            <input
              type="text"
              placeholder="Search by customer name or phone number (e.g. 0300...)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#D5CDC0] bg-[#FAF7F2] py-3 pl-10 pr-10 text-sm font-medium text-[#1C1917] outline-none transition placeholder:text-[#78716C]/70 focus:border-[#A66324] focus:bg-white focus:ring-2 focus:ring-[#A66324]/20 shadow-xs"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Pills & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center rounded-xl bg-[#FAF7F2] p-1 border border-[#E5DFD3]">
              <button
                onClick={() => {
                  setFilterType("all");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filterType === "all"
                    ? "bg-[#3B2417] text-white shadow-xs"
                    : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
              >
                All ({rawCustomers.length})
              </button>
              <button
                onClick={() => {
                  setFilterType("has-measurements");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filterType === "has-measurements"
                    ? "bg-[#3B2417] text-white shadow-xs"
                    : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
              >
                With Sizes ({totalWithMeasurements})
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#D5CDC0] bg-[#FAF7F2] px-3.5 py-2.5 text-xs font-bold text-[#1C1917] outline-none transition focus:border-[#A66324] focus:ring-2 focus:ring-[#A66324]/20"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center rounded-xl border border-[#E5DFD3] bg-[#FAF7F2] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition ${viewMode === "grid"
                    ? "bg-white text-[#A66324] shadow-xs"
                    : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                title="Grid Ledger View"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-lg p-1.5 transition ${viewMode === "table"
                    ? "bg-white text-[#A66324] shadow-xs"
                    : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                title="Table View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E5DFD3] bg-white py-20 text-[#78716C] shadow-sm">
            <Loader2 size={36} className="animate-spin text-[#A66324]" />
            <p className="mt-3 text-sm font-semibold">Opening customer register...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 py-16 text-center px-4">
            <AlertCircle size={36} className="text-red-500" />
            <h3 className="mt-3 text-base font-bold text-[#1C1917]">
              Unable to load customer directory
            </h3>
            <p className="mt-1 text-xs text-[#78716C] max-w-sm">
              {error?.message || "There was a network issue connecting to the tailoring database."}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries(["customers"])}
              className="mt-4 rounded-xl bg-white border border-[#D5CDC0] px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#F7F5F0] transition shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D5CDC0] bg-white py-20 text-center px-4 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5F0] text-[#A66324] border border-[#E5DFD3]">
              <Users size={32} />
            </div>
            <h3
              className="mt-4 text-xl font-bold text-[#1C1917]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {search ? "No matching clients found" : "Your Customer Ledger is Empty"}
            </h3>
            <p className="mt-1.5 max-w-md text-xs font-medium text-[#78716C] leading-relaxed">
              {search
                ? `No customers matched "${search}". Try searching by phone number or clear search.`
                : "Add your first client to record custom kurta, kameez, or suit measurements and generate order slips."}
            </p>
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl border border-[#D5CDC0] bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-white transition"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-5 py-3 text-xs font-bold text-white shadow-md transition"
              >
                <Plus size={16} />
                <span>Add Your First Customer</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* View Mode 1: Rich Ledger Card Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {paginatedCustomers.map((customer) => {
                  const initials = (customer.name || "C")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  const measurements = customer.measurements || [];
                  const cleanPhone = customer.phoneNumber?.replace(/\D/g, "");

                  return (
                    <div
                      key={customer._id}
                      onClick={() => navigate(`/customers/${customer._id}`)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#A66324]/50 hover:shadow-lg cursor-pointer"
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#3B2417] text-sm font-bold text-[#E7D8CC] shadow-inner group-hover:bg-[#A66324] group-hover:text-white transition-colors">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-[#1C1917] text-base group-hover:text-[#A66324] transition-colors line-clamp-1">
                                {customer.name || "Unnamed Customer"}
                              </h3>
                              <span className="font-mono text-[11px] font-semibold text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DFD3]">
                                #{customer._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* WhatsApp link */}
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/92${cleanPhone.replace(/^0/, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Chat on WhatsApp"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition"
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}
                            {/* Direct Call */}
                            <a
                              href={`tel:${customer.phoneNumber}`}
                              onClick={(e) => e.stopPropagation()}
                              title="Call Customer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF7F2] text-[#78716C] hover:bg-[#E5DFD3] hover:text-[#1C1917] transition border border-[#E5DFD3]"
                            >
                              <Phone size={14} />
                            </a>
                          </div>
                        </div>

                        {/* Phone Number Display */}
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#1C1917]">
                          <span className="text-[#78716C] font-normal">Phone:</span>
                          <span>{customer.phoneNumber}</span>
                        </div>

                        {/* Measurement Sheet Ledger Preview */}
                        <div className="mt-4 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] p-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#78716C] pb-2 border-b border-[#E5DFD3]/60 mb-2">
                            <span className="flex items-center gap-1.5 text-[#A66324]">
                              <Ruler size={13} />
                              <span>Measurement Sheet</span>
                            </span>
                            <span>{measurements.length} sizes</span>
                          </div>

                          {measurements.length > 0 ? (
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {measurements.slice(0, 4).map((m, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between rounded-md bg-white px-2 py-1 border border-[#E5DFD3]/80"
                                >
                                  <span className="text-[11px] font-medium text-[#78716C] truncate pr-1">
                                    {m.label.split(" ")[0]}
                                  </span>
                                  <span className="font-mono text-xs font-bold text-[#1C1917]">
                                    {m.value}"
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] italic text-[#78716C]/80 py-1 text-center">
                              No sizes recorded yet
                            </p>
                          )}

                          {measurements.length > 4 && (
                            <p className="mt-2 text-center text-[10px] font-semibold text-[#A66324]">
                              +{measurements.length - 4} more size points on file
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 flex items-center justify-between border-t border-[#EDE8DE] pt-3 text-xs">
                        <span className="text-[11px] text-[#78716C]">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                            : "Recent client"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#A66324] group-hover:translate-x-1 transition-transform">
                          <span>View Profile</span>
                          <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View Mode 2: Clean Ledger Table */
              <div className="overflow-hidden rounded-2xl border border-[#E5DFD3] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#E5DFD3] bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider text-[#78716C]">
                      <tr>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Phone Number</th>
                        <th className="px-6 py-4">Saved Measurements</th>
                        <th className="px-6 py-4">Registered Date</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE8DE]">
                      {paginatedCustomers.map((customer) => {
                        const initials = (customer.name || "C")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <tr
                            key={customer._id}
                            onClick={() => navigate(`/customers/${customer._id}`)}
                            className="group cursor-pointer transition hover:bg-[#FAF7F2]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B2417] text-xs font-bold text-[#E7D8CC] group-hover:bg-[#A66324] group-hover:text-white transition-colors">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-bold text-[#1C1917] group-hover:text-[#A66324] transition-colors">
                                    {customer.name || "Unnamed"}
                                  </p>
                                  <span className="font-mono text-[11px] text-[#78716C]">
                                    #{customer._id.slice(-6).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-semibold text-[#1C1917]">
                              {customer.phoneNumber}
                            </td>

                            <td className="px-6 py-4">
                              {customer.measurements?.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                                  {customer.measurements.slice(0, 3).map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[11px] font-bold text-[#A66324] border border-[#E5DFD3]"
                                    >
                                      {m.label.split(" ")[0]}: {m.value}"
                                    </span>
                                  ))}
                                  {customer.measurements.length > 3 && (
                                    <span className="text-[11px] font-semibold text-[#78716C]">
                                      +{customer.measurements.length - 3} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-[#78716C] italic">
                                  No sizes recorded
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-xs font-medium text-[#78716C]">
                              {customer.createdAt
                                ? new Date(customer.createdAt).toLocaleDateString()
                                : "—"}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#A66324] group-hover:translate-x-1 transition-transform">
                                Open Ledger
                                <ChevronRight size={15} />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5DFD3] pt-5 sm:flex-row">
                <p className="text-xs font-semibold text-[#78716C]">
                  Showing <span className="text-[#1C1917]">{startIndex + 1}</span> to{" "}
                  <span className="text-[#1C1917]">
                    {Math.min(startIndex + itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="text-[#1C1917]">{totalItems}</span> clients
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition ${currentPage === pageNum
                            ? "bg-[#3B2417] text-white shadow-sm"
                            : "border border-[#D5CDC0] bg-white text-[#1C1917] hover:bg-[#FAF7F2]"
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Customer Modal - HIGH CONTRAST & SOLID BACKGROUND */}
      {isAddModalOpen && (
        <AddCustomerModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(newCustomer) => {
            setIsAddModalOpen(false);
            queryClient.invalidateQueries(["customers"]);
            if (newCustomer?._id) {
              navigate(`/customers/${newCustomer._id}`);
            }
          }}
        />
      )}
    </div>
  );
}

// Solid High-Contrast Add Customer Modal
function AddCustomerModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [measurements, setMeasurements] = useState([
    { label: "Length (لمبائی)", value: "" },
    { label: "Chest (چھاتی)", value: "" },
    { label: "Waist (کمر)", value: "" },
    { label: "Shoulder / Teera (تیرا)", value: "" },
    { label: "Sleeves (بازو)", value: "" },
  ]);
  const [customLabel, setCustomLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // per-field errors, e.g. { phoneNumber: "..." }

  const { mutate: handleAddCustomer, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      onSuccess(data?.customer);
    },
    onError: (err) => {
      const responseData = err?.response?.data;

      // Mongoose validation errors usually arrive as an object keyed by field name,
      // e.g. { errors: { phoneNumber: { message: "Enter a valid Pakistani phone number" } } }
      if (responseData?.errors && typeof responseData.errors === "object") {
        const extractedFieldErrors = {};
        Object.entries(responseData.errors).forEach(([field, val]) => {
          extractedFieldErrors[field] = val?.message || String(val);
        });
        setFieldErrors(extractedFieldErrors);

        // Show the first one as the main banner too, so it's impossible to miss
        const firstMessage = Object.values(extractedFieldErrors)[0];
        setErrorMsg(firstMessage || "Please check the highlighted fields.");
        return;
      }

      // Fallback: single message from backend (duplicate phone, generic failure, etc.)
      setErrorMsg(
        responseData?.message ||
        responseData?.messaage ||
        "Failed to add customer. Please check the inputs and try again."
      );
    },
  });

  const validatePhone = (value) => /^03\d{9}$/.test(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedPhone = phoneNumber.trim();
    const newFieldErrors = {};

    if (!trimmedName) {
      newFieldErrors.name = "Customer name is required.";
    }

    if (!trimmedPhone) {
      newFieldErrors.phoneNumber = "Phone number is required.";
    } else if (!validatePhone(trimmedPhone)) {
      newFieldErrors.phoneNumber = "Enter a valid number, e.g. 03001234567.";
    }

    // Filter out completely empty measurement fields
    const validMeasurements = measurements
      .filter((m) => m.label.trim() && m.value.trim())
      .map((m) => ({
        label: m.label.trim(),
        value: m.value.trim(),
      }));

    if (validMeasurements.length === 0) {
      newFieldErrors.measurements = "Please provide at least one measurement (e.g. Length or Chest).";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMsg(Object.values(newFieldErrors)[0]);
      return;
    }

    handleAddCustomer({
      name: trimmedName,
      phoneNumber: trimmedPhone,
      measurements: validMeasurements,
    });
  };

  // Only allow digits and a single decimal point (e.g. "40" or "40.5") — blocks letters entirely
  const handleMeasurementChange = (index, rawValue) => {
    const sanitized = rawValue.replace(/[^0-9.]/g, "");

    // prevent more than one decimal point (e.g. typing "40..5")
    const parts = sanitized.split(".");
    const cleaned = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized;

    setMeasurements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: cleaned };
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

  const handleAddPreset = (presetLabel) => {
    if (measurements.some((m) => m.label === presetLabel)) return;
    setMeasurements((prev) => [...prev, { label: presetLabel, value: "" }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-[#E5DFD3] bg-[#FFFFFF] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5DFD3] px-6 py-5 bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3B2417] text-white">
              <Scissors size={20} />
            </div>
            <div>
              <h3
                className="text-xl font-bold text-[#1C1917]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                New Customer Profile<span className="text-[#A66324]">.</span>
              </h3>
              <p className="text-xs text-[#78716C] font-medium">
                Record client details and tailoring measurements sheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl p-2 text-[#78716C] hover:bg-[#E5DFD3]/60 hover:text-[#1C1917] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 bg-white">
          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200 shadow-xs">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Details Box */}
          <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF7F2] p-4.5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              1. Contact Information
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Customer Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1C1917] outline-none transition focus:ring-2 shadow-xs ${fieldErrors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-[#D5CDC0] focus:border-[#A66324] focus:ring-[#A66324]/20"
                  }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="03001234567"
                value={phoneNumber}
                onChange={(e) => {
                  // only digits, max 11 characters (matches 03XXXXXXXXX)
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setPhoneNumber(digitsOnly);
                  if (fieldErrors.phoneNumber)
                    setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1C1917] outline-none transition focus:ring-2 shadow-xs ${fieldErrors.phoneNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-[#D5CDC0] focus:border-[#A66324] focus:ring-[#A66324]/20"
                  }`}
              />
              <p
                className={`mt-1 text-[11px] font-semibold ${fieldErrors.phoneNumber ? "text-red-600" : "text-[#78716C]"
                  }`}
              >
                {fieldErrors.phoneNumber || "Format: 03XXXXXXXXX (Standard Pakistani mobile number)"}
              </p>
            </div>
          </div>

          {/* Measurements Ledger Section */}
          <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF7F2] p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  2. Measurements Sheet (Inches)
                </h4>
                <p className="text-[11px] text-[#78716C]">
                  Fill in the size points needed for sewing — numbers only.
                </p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-[#78716C] mb-1.5 block">
                Quick Add Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MEASUREMENT_PRESETS.map((preset, idx) => {
                  const alreadyAdded = measurements.some((m) => m.label === preset.label);
                  if (alreadyAdded) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.label)}
                      className="cursor-pointer rounded-lg border border-[#D5CDC0] bg-white px-2 py-1 text-[11px] font-semibold text-[#1C1917] hover:border-[#A66324] hover:text-[#A66324] transition shadow-2xs"
                    >
                      + {preset.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of active measurement fields */}
            <div className="space-y-2 pt-2">
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
                      inputMode="decimal"
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
                    className="cursor-pointer p-1.5 text-[#78716C] hover:text-red-600 transition"
                    title="Remove field"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            {fieldErrors.measurements && (
              <p className="text-[11px] font-semibold text-red-600">{fieldErrors.measurements}</p>
            )}

            {/* Custom Field Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom size (e.g. Cuff / کف)..."
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
                className="cursor-pointer rounded-xl border border-[#D5CDC0] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition shadow-2xs"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="border-t border-[#E5DFD3] pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-[#D5CDC0] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A66324] hover:bg-[#8C511B] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>{isPending ? "Recording in Ledger..." : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
