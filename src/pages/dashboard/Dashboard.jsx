import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Users } from "lucide-react";

import { Link } from "react-router-dom";

import StatCard from "../../pages/dashboard/overview/StateCard";
import { dashboardSummary } from "../../api/dashboardSummary";
import OrderOverview from "../../pages/dashboard/overview/OrderOverview";

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardSummary,
  });

  const summary = data?.data;

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/orders" className="block transition active:scale-[0.99]">
          <StatCard
            title="Total Orders"
            isLoading={isLoading}
            value={summary?.totalOrders}
            icon={ShoppingCart}
          />
        </Link>

        <Link to="/customers" className="block transition active:scale-[0.99]">
          <StatCard
            title="Customers"
            isLoading={isLoading}
            value={summary?.totalCustomers}
            icon={Users}
          />
        </Link>
      </section>
      <OrderOverview
        pendingOrders={summary?.pendingOrders}
        readyOrders={summary?.readyOrders}
        deliveredOrders={summary?.deliveredOrders}
        isLoading={isLoading}
      />
    </div>
  );
}
