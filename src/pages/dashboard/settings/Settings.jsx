import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Store,
    User,
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    Banknote,
    FileText,
    Pencil,
    Loader2,
    Save,
    X,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import authStore from "../../../store/store";
import { updateShopSettings } from "../../../api/shopApi.js"

const FIELD_CONFIG = [
    { name: "shopName", label: "Shop Name", icon: Store, type: "text" },
    { name: "ownerName", label: "Owner Name", icon: User, type: "text" },
    { name: "phoneNumber", label: "Phone Number", icon: Phone, type: "text" },
    { name: "email", label: "Email Address", icon: Mail, type: "email" },
    { name: "address", label: "Shop Address", icon: MapPin, type: "text" },
    { name: "whatsappNumber", label: "WhatsApp Number", icon: MessageCircle, type: "text" },
    { name: "currencySymbol", label: "Currency Symbol", icon: Banknote, type: "text" },
    { name: "receiptFooterMessage", label: "Receipt Footer Message", icon: FileText, type: "textarea" },
];

export default function Settings() {
    const shop = authStore((state) => state.shop);
    const updateShop = authStore((state) => state.updateShop);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [successMsg, setSuccessMsg] = useState("");

    // Sync local form state whenever the store's shop data changes
    useEffect(() => {
        if (shop) {
            setFormData({
                shopName: shop.shopName || "",
                ownerName: shop.ownerName || "",
                phoneNumber: shop.phoneNumber || "",
                email: shop.email || "",
                address: shop.address || "",
                whatsappNumber: shop.whatsappNumber || "",
                currencySymbol: shop.currencySymbol || "Rs.",
                receiptFooterMessage: shop.receiptFooterMessage || "",
            });
        }
    }, [shop]);

    const {
        mutate: saveSettings,
        isPending: isSaving,
        error: saveError,
    } = useMutation({
        mutationFn: (updatedFields) => updateShopSettings(updatedFields),
        onSuccess: (data) => {
            // data.shop is whatever your controller returns after findByIdAndUpdate
            updateShop(data.shop);
            setIsEditing(false);
            setSuccessMsg("Settings updated successfully.");
            setTimeout(() => setSuccessMsg(""), 3000);
        },
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        if (shop) {
            setFormData({
                shopName: shop.shopName || "",
                ownerName: shop.ownerName || "",
                phoneNumber: shop.phoneNumber || "",
                email: shop.email || "",
                address: shop.address || "",
                whatsappNumber: shop.whatsappNumber || "",
                currencySymbol: shop.currencySymbol || "Rs.",
                receiptFooterMessage: shop.receiptFooterMessage || "",
            });
        }
        setIsEditing(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveSettings(formData);
    };

    if (!shop) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#736B63]">
                <Loader2 size={36} className="animate-spin text-[#3B2417]" />
                <p className="mt-3 text-sm font-bold text-[#1C1917]">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[900px] space-y-7 pb-16">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E3DA] pb-5">
                <div>
                    <h1
                        className="text-2xl font-black text-[#1C1917] sm:text-3xl"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        Shop Settings
                    </h1>
                    <p className="text-xs text-[#736B63] font-medium mt-1">
                        Manage your shop profile and receipt details
                    </p>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B2417] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
                    >
                        <Pencil size={14} />
                        <span>Edit Settings</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D1C5] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#F9F7F4] transition disabled:opacity-50"
                        >
                            <X size={14} />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B2417] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </div>
                )}
            </div>

            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                    <CheckCircle size={16} />
                    <span>{successMsg}</span>
                </div>
            )}

            {saveError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                    <AlertCircle size={16} />
                    <span>
                        {saveError?.response?.data?.message ||
                            saveError?.message ||
                            "Failed to save settings. Please try again."}
                    </span>
                </div>
            )}

            <form
                onSubmit={handleSave}
                className="rounded-3xl border border-[#E8E3DA] bg-white p-6 shadow-sm sm:p-8 space-y-5"
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {FIELD_CONFIG.map(({ name, label, icon: Icon, type }) => (
                        <div key={name} className={type === "textarea" ? "sm:col-span-2" : ""}>
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#736B63] mb-1.5">
                                <Icon size={13} className="text-[#3B2417]" />
                                {label}
                            </label>

                            {type === "textarea" ? (
                                <textarea
                                    value={formData[name] || ""}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    disabled={!isEditing}
                                    rows={2}
                                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#1C1917] transition resize-none ${isEditing
                                        ? "border-[#D8D1C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B2417]/20"
                                        : "border-[#E8E3DA] bg-[#F9F7F4] text-[#736B63]"
                                        }`}
                                />
                            ) : (
                                <input
                                    type={type}
                                    value={formData[name] || ""}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#1C1917] transition ${isEditing
                                        ? "border-[#D8D1C5] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B2417]/20"
                                        : "border-[#E8E3DA] bg-[#F9F7F4] text-[#736B63]"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </form>
        </div>
    );
}