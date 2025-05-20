import { useState } from "react";
import { createDeposit } from "@/services/transactionService";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DepositFormProps {
  walletAddress: string;
  activeNetwork: string;
  onSuccess?: () => void;
}

const walletAddresses = {
  btc: "bc1qjutzcd5fmrtrnkqtzc5dzaurhg5y5tyhelhn0z",
  eth: "0xFB5Cec93252fCDF91f5841e181123c995D8E3D9c",
  sol: "64Qr3DthwMAEyjRvEoQfFdorkdoUXjkkwW18Eng4kFKb",
  usdt: "64Qr3DthwMAEyjRvEoQfFdorkdoUXjkkwW18Eng4kFKb" // USDT on SOL blockchain
};

const DepositForm = ({ walletAddress, activeNetwork, onSuccess }: DepositFormProps) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const address = walletAddresses[activeNetwork] || walletAddress;
  
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard"
    });
  };
  
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const amount = Number(depositAmount);
      const { success, error } = await createDeposit(amount, activeNetwork, txHash || undefined);
      
      if (success) {
        toast({
          title: "Deposit request submitted",
          description: "Your deposit is now pending confirmation"
        });
        setDepositAmount("");
        setTxHash("");
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Deposit failed",
          description: error || "Failed to create deposit",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating deposit:", error);
      toast({
        title: "Deposit error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-lodge-dark-bg p-3 rounded-md">
        <code className="text-sm text-white/80 flex-grow break-all">
          {address}
        </code>
        <GradientButton 
          onClick={copyWalletAddress} 
          className="flex-shrink-0"
        >
          <Copy className="w-4 h-4" />
        </GradientButton>
      </div>
      
      <form onSubmit={handleDepositSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount in USD ($)</Label>
          <Input
            id="amount"
            type="number"
            min="10"
            step="0.01"
            placeholder="100.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-lodge-dark-bg border-white/10 mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="txHash">Transaction Hash (Optional)</Label>
          <Input
            id="txHash"
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="bg-lodge-dark-bg border-white/10 mt-1"
          />
          <p className="text-xs text-white/60 mt-1">
            If you already sent funds, paste the transaction hash for faster verification
          </p>
        </div>
        
        <GradientButton 
          type="submit" 
          className="w-full button-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Deposit Request"}
        </GradientButton>
      </form>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-lodge-purple/10 rounded-lg border border-lodge-purple/20">
        <div className="text-white/80 text-sm space-y-2">
          <p className="font-medium">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Only send {activeNetwork.toUpperCase()} to this address</li>
            <li>Minimum deposit: $100 worth of {activeNetwork.toUpperCase()}</li>
            <li>Deposits typically confirm within 30 minutes</li>
            <li>Contact support if your deposit doesn't appear after 2 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepositForm;
