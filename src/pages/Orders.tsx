import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import OrderCard, { Order } from "@/components/ui/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs as VercelTabs } from "@/components/ui/vercel-tabs";
import { Search } from "lucide-react";
import { getUserOrders } from "@/services/orderService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { GradientButton } from "@/components/ui/gradient-button";

const orderTabs = [
  { id: "all", label: "All Orders" },
  { id: "unfulfilled", label: "Unfulfilled" },
  { id: "processing", label: "Processing" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "cancelled", label: "Cancelled" },
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch orders using React Query
  const { data: orders = [], isLoading, isError: ordersError, error: ordersErrorObj } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders
  });
  
  // Filter orders based on active tab and search term
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (activeTab !== "all" && order.status !== activeTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const orderIdMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const productMatch = order.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!orderIdMatch && !productMatch) {
        return false;
      }
    }
    
    return true;
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filtered orders
  };

  // Show toast notifications for errors
  useEffect(() => {
    if (ordersError) {
      toast.error("Failed to load orders: " + (ordersErrorObj?.message || "Unknown error"));
    }
  }, [ordersError, ordersErrorObj]);

  return (
    <Layout>
      <ErrorBoundary>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-white/60">
                Track and manage all your product orders
              </p>
            </div>
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                <Input
                  placeholder="Search by order ID or product"
                  className="pl-10 bg-lodge-card-bg border-white/10 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="mb-6">
            <VercelTabs
              tabs={orderTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="mb-8"
            />
            {/* Orders Content */}
            <div className="mt-6">
              {ordersError ? (
                <div className="text-center py-16">
                  <p className="text-red-400 mb-4">
                    Failed to load orders: {ordersErrorObj?.message || "Unknown error"}
                  </p>
                  <GradientButton onClick={() => window.location.reload()}>
                    Retry
                  </GradientButton>
                </div>
              ) : isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 animate-pulse bg-lodge-card-bg rounded-lg"></div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-white/60 mb-4">No orders found matching your search criteria</p>
                  {searchTerm && (
                    <GradientButton onClick={() => setSearchTerm("")}>
                      Clear Search
                    </GradientButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default Orders;
