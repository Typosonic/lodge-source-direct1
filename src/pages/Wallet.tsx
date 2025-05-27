import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserTransactions, getUserWalletBalance } from "@/services/transactionService";
import DepositForm from "@/components/wallet/DepositForm";
import TransactionList from "@/components/wallet/TransactionList";
import WalletBalance from "@/components/wallet/WalletBalance";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const Wallet = () => {
  // Define wallet addresses for different networks
  const walletAddresses = {
    btc: "bc1qjutzcd5fmrtrnkqtzc5dzaurhg5y5tyhelhn0z",
    eth: "0xFB5Cec93252fCDF91f5841e181123c995D8E3D9c",
    sol: "64Qr3DthwMAEyjRvEoQfFdorkdoUXjkkwW18Eng4kFKb",
    usdt: "64Qr3DthwMAEyjRvEoQfFdorkdoUXjkkwW18Eng4kFKb" // USDT on SOL blockchain
  };
  
  const [activeNetwork, setActiveNetwork] = useState<string>("btc");
  
  // Get current wallet address based on selected network
  const currentWalletAddress = walletAddresses[activeNetwork as keyof typeof walletAddresses];
  
  // Fetch wallet balance and transactions using React Query
  const { 
    data: balance = 0,
    refetch: refetchBalance,
    isLoading: isBalanceLoading
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: getUserWalletBalance
  });
  
  const {
    data: transactions = [],
    refetch: refetchTransactions,
    isLoading: isTransactionsLoading
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: getUserTransactions
  });
  
  const handleSuccess = () => {
    // Refetch data after successful deposit
    refetchTransactions();
    // Balance won't update until deposit is confirmed by admin
    refetchBalance();
  };

  const solWalletAddress = "64Qr3DthwMAEyjRvEoQfFdorkdoUXjkkwW18Eng4kFKb";

  const [showCashAppThankYou, setShowCashAppThankYou] = useState(false);
  const [cashAppForm, setCashAppForm] = useState({
    amount: '',
    username: '',
    screenshot: null as File | null,
    notes: '',
  });

  const handleCashAppFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    setCashAppForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCashAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCashAppThankYou(true);
    // Optionally, handle upload or send to backend here
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* 🚨 Top-Up via Cash App Section 🚨 */}
        <div className="bg-lodge-card-bg border border-green-500/30 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold mb-2 text-green-400 flex items-center gap-2">
              🚨 How to Top Up via Cash App 🚨
            </h1>
            <ol className="list-decimal list-inside text-white/80 text-sm space-y-2 mb-4">
              <li>Send the desired amount to: <b className="text-green-400">$Typosonic</b></li>
              <li>In the payment note, include your <b>username</b> or <b>order ID</b></li>
              <li>Upload proof of payment below</li>
              <li>Your balance will be credited shortly</li>
            </ol>
            <div className="flex items-center gap-4 mb-4">
              <a href="https://cash.app/$Typosonic" target="_blank" rel="noopener noreferrer" className="text-green-400 underline font-semibold">Pay via Cash App</a>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://cash.app/$Typosonic"
                alt="Cash App QR Code"
                className="w-28 h-28 rounded bg-white p-1 border border-green-400"
              />
            </div>
            {/* Confirmation Form */}
            <div className="mt-4">
              {showCashAppThankYou ? (
                <div className="p-4 bg-green-900/60 rounded text-green-300 font-semibold text-center">
                  ✅ Thank you! Your payment confirmation has been received. Your balance will be credited shortly.
                </div>
              ) : (
                <form onSubmit={handleCashAppSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-white/80 font-medium mb-1">Amount Sent ($)</label>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={cashAppForm.amount}
                      onChange={handleCashAppFormChange}
                      className="w-full bg-lodge-dark-bg border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-white/80 font-medium mb-1">Username / Order ID</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={cashAppForm.username}
                      onChange={handleCashAppFormChange}
                      className="w-full bg-lodge-dark-bg border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="screenshot" className="block text-white/80 font-medium mb-1">Screenshot of Payment</label>
                    <input
                      id="screenshot"
                      name="screenshot"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleCashAppFormChange}
                      className="w-full bg-lodge-dark-bg border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-white/80 font-medium mb-1">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      value={cashAppForm.notes}
                      onChange={handleCashAppFormChange}
                      className="w-full bg-lodge-dark-bg border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <GradientButton
                    type="submit"
                    className="w-full button-glow"
                  >
                    ✅ Submit Confirmation
                  </GradientButton>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* Top-Up Balance Section */}
        <div className="bg-lodge-card-bg border border-white/10 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold mb-2">Top Up Your Balance</h1>
            <p className="text-white/70 mb-4">Deposit SOL (Solana) to your wallet address below, or buy crypto instantly with your card.</p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
              <div className="bg-lodge-dark-bg border border-white/10 rounded px-3 py-2 font-mono text-white/80 text-sm break-all select-all">
                {solWalletAddress}
              </div>
              <GradientButton
                className="flex items-center gap-2 px-4 py-2"
                onClick={() => {
                  navigator.clipboard.writeText(solWalletAddress);
                  toast.success("Wallet address copied!");
                }}
              >
                <Copy className="w-4 h-4" /> Copy Wallet Address
              </GradientButton>
              <GradientButton
                asChild
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700"
              >
                <a
                  href="https://www.moonpay.com/buy/sol?walletAddress=64Qr3DthwMAEyjRvEoQfFdorkdoUXjkkwW18Eng4kFKb"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy SOL with Card
                </a>
              </GradientButton>
            </div>
            <div className="text-white/60 text-sm">
              <b>Not familiar with crypto?</b> Click "Buy SOL with Card" to purchase Solana using your debit/credit card. Funds will be sent directly to your wallet address above. After sending, your balance will update once your deposit is confirmed.
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wallet</h1>
            <p className="text-white/60">
              Manage your balance and transaction history
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <WalletBalance 
            balance={balance} 
          />
          
          {/* Top Up Card */}
          <Card className="bg-lodge-card-bg border-white/10 col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>How to Deposit</CardTitle>
              <CardDescription>
                <div className="space-y-2">
                  <p>Send crypto to the address below to top up your balance.</p>
                  <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                    <li>Supports <b>BTC</b>, <b>ETH</b>, <b>SOL</b>, and <b>USDT</b> networks</li>
                    <li>Minimum top-up amount: <b>$50</b></li>
                    <li>Choose your network tab below to get the correct address.</li>
                  </ul>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeNetwork} onValueChange={setActiveNetwork}>
                <TabsList className="bg-lodge-dark-bg border border-white/10 p-1 mb-4">
                  <TabsTrigger 
                    value="btc"
                    className="data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    Bitcoin (BTC)
                  </TabsTrigger>
                  <TabsTrigger 
                    value="eth"
                    className="data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    Ethereum (ETH)
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sol"
                    className="data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    Solana (SOL)
                  </TabsTrigger>
                  <TabsTrigger 
                    value="usdt"
                    className="data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    Tether (USDT)
                  </TabsTrigger>
                </TabsList>
                <DepositForm 
                  walletAddress={currentWalletAddress}
                  activeNetwork={activeNetwork}
                  onSuccess={handleSuccess}
                />
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Transaction History */}
        <Card className="bg-lodge-card-bg border-white/10">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent deposits and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={transactions}
              isLoading={isTransactionsLoading}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Wallet;
