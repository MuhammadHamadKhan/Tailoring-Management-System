import { Clock3, Shirt, CheckCircle2 } from "lucide-react";

export default function OrderOverview({
  pendingOrders,
  readyOrders,
  deliveredOrders,
  isLoading,
}) {
  const orderStatuses = [
    {
      title: "Pending",
      value: pendingOrders,
      description: "Orders waiting to be processed",
      icon: Clock3,
    },
    {
      title: "Ready",
      value: readyOrders,
      description: "Orders ready for customer",
      icon: Shirt,
    },
    {
      title: "Delivered",
      value: deliveredOrders,
      description: "Orders delivered to customers",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-heading sm:text-xl">
          Order Overview
        </h2>

        <p className="mt-1 text-sm font-medium text-muted">
          Current status of your orders
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {orderStatuses.map((status) => {
          const Icon = status.icon;

          return (
            <div
              key={status.title}
              className="
                rounded-xl border border-border bg-bg
                p-4 sm:p-5
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted">
                    {status.title}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-heading">
                    {isLoading ? (
                      <span className="animate-ping ease-in-out ">...</span>
                    ) : (
                      (status.value ?? 0)
                    )}
                  </h3>
                </div>

                <div
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-xl bg-amber-50 text-primary
                  "
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
              </div>

              <p className="mt-3 text-xs font-medium text-muted sm:text-sm">
                {status.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
