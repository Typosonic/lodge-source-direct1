import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Copy, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OrderCard from "@/components/ui/OrderCard";
import { getUserTransactions, getUserWalletBalance } from "@/services/transactionService";
import TransactionList from "@/components/wallet/TransactionList";
import WalletBalance from "@/components/wallet/WalletBalance";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getUserOrders } from "@/services/orderService";

const Dashboard = () => {
  const [walletAddress] = useState("0xf3b1a8a32a6f19937b9d8d97fd2db18b8edf7687");
  
  // Fetch real data using React Query
  const { 
    data: balance = 0, 
    isLoading: balanceLoading 
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: getUserWalletBalance
  });
  
  const {
    data: transactions = [],
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: getUserTransactions
  });
  
  // Get only the recent transactions
  const recentTransactions = transactions.slice(0, 3);
  
  const { isEmailVerified, user } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setResendError(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: user?.email });
      if (error) {
        setResendError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  // Fetch real user orders using React Query
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorObj
  } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: getUserOrders,
    enabled: !!user,
  });

  // Get only the 2 most recent orders
  const recentOrders = orders.slice(0, 2);

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard"
    });
  };

  return (
    <Layout>
      {!isEmailVerified ? (
        <div className="max-w-xl mx-auto mt-12 p-6 bg-yellow-900/80 border border-yellow-600 rounded text-center">
          <h2 className="text-xl font-bold text-yellow-300 mb-2">Verify Your Email</h2>
          <p className="text-yellow-100 mb-4">
            Please verify your email address to access your dashboard. Check your inbox for a verification link.
          </p>
          <GradientButton
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="bg-yellow-500 hover:bg-yellow-600 font-semibold"
          >
            {resendLoading ? 'Resending...' : 'Resend Verification Email'}
          </GradientButton>
          {resendSuccess && (
            <p className="mt-2 text-green-300">Verification email sent!</p>
          )}
          {resendError && (
            <p className="mt-2 text-red-300">{resendError}</p>
          )}
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-white/60">
                Manage your reseller business from one dashboard
              </p>
            </div>
            <div className="flex gap-4">
              <GradientButton 
                className="border-white/20 hover:bg-white/5"
                asChild
              >
                <Link to="/catalog">Browse Products</Link>
              </GradientButton>
              <GradientButton>
                <Link to="/orders">View All Orders</Link>
              </GradientButton>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <WalletBalance balance={balance} />
            
            {/* Wallet Address Card */}
            <Card className="bg-lodge-card-bg border-white/10 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>How to Deposit</CardTitle>
                <CardDescription>Follow these steps to top up your balance:</CardDescription>
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <div className="h-16 animate-pulse bg-white/10 rounded"></div>
                ) : (
                  <div className="space-y-4">
                    <ol className="list-decimal list-inside text-white/80 text-sm space-y-2">
                      <li>
                        Go to the <Link to="/wallet" className="text-lodge-purple underline">Wallet</Link> page.
                      </li>
                      <li>
                        Select your preferred network (BTC, ETH, SOL, or USDT).
                      </li>
                      <li>
                        Copy the deposit address shown for your selected network.
                      </li>
                      <li>
                        Send at least <b>$50</b> worth of crypto to the copied address.
                      </li>
                      <li>
                        After sending, you can optionally enter your transaction hash for faster verification.
                      </li>
                      <li>
                        Your balance will update once your deposit is confirmed.
                      </li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Orders */}
            <Card className="bg-lodge-card-bg border-white/10 col-span-1 lg:col-span-2 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest product orders</CardDescription>
                </div>
                <GradientButton 
                  asChild
                  className="text-white"
                >
                  <Link to="/orders" className="flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </GradientButton>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1,2].map(i => (
                      <div key={i} className="h-24 animate-pulse bg-white/10 rounded"></div>
                    ))}
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8 text-red-400">
                    <p>Failed to load orders: {ordersErrorObj?.message || "Unknown error"}</p>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <p>No orders found</p>
                    <GradientButton 
                      asChild 
                      className="text-white"
                    >
                      <Link to="/catalog">Browse Products</Link>
                    </GradientButton>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Transaction History */}
            <Card className="bg-lodge-card-bg border-white/10 col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Recent wallet activity</CardDescription>
                </div>
                <GradientButton 
                  asChild
                  className="text-white"
                >
                  <Link to="/wallet" className="flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </GradientButton>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 animate-pulse bg-white/10 rounded"></div>
                    <div className="h-10 animate-pulse bg-white/10 rounded"></div>
                    <div className="h-10 animate-pulse bg-white/10 rounded"></div>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    <TransactionList 
                      transactions={recentTransactions}
                    />
                    {recentTransactions.length > 0 && (
                      <div className="mt-2 text-center">
                        <GradientButton 
                          asChild 
                          className="text-white text-sm"
                        >
                          <Link to="/wallet">View all transactions</Link>
                        </GradientButton>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <GradientButton 
              className="h-auto py-6 border-white/10 hover:bg-white/5 text-black"
              asChild
            >
              <Link to="/catalog" className="flex flex-col items-center gap-2">
                <span className="text-2xl">🛍️</span>
                <span>Browse Products</span>
              </Link>
            </GradientButton>
            
            <GradientButton className="h-auto py-6" asChild>
              <Link to="/wallet" className="flex flex-col items-center gap-2 w-full">
                <span className="text-2xl">💰</span>
                <span>Top Up Balance</span>
              </Link>
            </GradientButton>
            
            <GradientButton 
              className="h-auto py-6 border-white/10 hover:bg-white/5 text-black"
              asChild
            >
              <Link to="/orders" className="flex flex-col items-center gap-2">
                <span className="text-2xl">📦</span>
                <span>Track Orders</span>
              </Link>
            </GradientButton>
            
            <GradientButton 
              className="h-auto py-6 border-white/10 hover:bg-white/5 text-black"
              asChild
            >
              <Link to="/support" className="flex flex-col items-center gap-2">
                <span className="text-2xl">🤝</span>
                <span>Get Support</span>
              </Link>
            </GradientButton>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
