import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserTransactions, getUserWalletBalance } from "@/services/transactionService";
import DepositForm from "@/components/wallet/DepositForm";
import TransactionList from "@/components/wallet/TransactionList";
import WalletBalance from "@/components/wallet/WalletBalance";

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

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
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
