
import { useState } from "react";
import { createWithdrawal } from "@/services/transactionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WithdrawalFormProps {
  balance: number;
  onSuccess?: () => void;
}

const WithdrawalForm = ({ balance, onSuccess }: WithdrawalFormProps) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [network, setNetwork] = useState("btc");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawalAddress) {
      toast({
        title: "Missing address",
        description: "Please enter a withdrawal address",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, error } = await createWithdrawal(
        amount,
        withdrawalAddress,
        network
      );

      if (success) {
        toast({
          title: "Withdrawal request submitted",
          description: "Your withdrawal request is now pending review",
        });
        setWithdrawalAmount("");
        setWithdrawalAddress("");
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Withdrawal failed",
          description: error || "Failed to create withdrawal request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      toast({
        title: "Withdrawal error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount in USD ($)</Label>
        <Input
          id="amount"
          type="number"
          min="10"
          step="0.01"
          placeholder="100.00"
          value={withdrawalAmount}
          onChange={(e) => setWithdrawalAmount(e.target.value)}
          className="bg-lodge-dark-bg border-white/10 mt-1"
          required
        />
        <p className="text-xs text-white/60 mt-1">
          Available balance: ${balance.toFixed(2)}
        </p>
      </div>

      <div>
        <Label htmlFor="network">Network</Label>
        <Select value={network} onValueChange={setNetwork}>
          <SelectTrigger className="bg-lodge-dark-bg border-white/10 mt-1">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent className="bg-lodge-card-bg border-white/10">
            <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
            <SelectItem value="eth">Ethereum (ETH)</SelectItem>
            <SelectItem value="usdt">Tether (USDT)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Wallet Address</Label>
        <Input
          id="address"
          placeholder="0x..."
          value={withdrawalAddress}
          onChange={(e) => setWithdrawalAddress(e.target.value)}
          className="bg-lodge-dark-bg border-white/10 mt-1"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
      </Button>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-lodge-purple/10 rounded-lg border border-lodge-purple/20">
        <div className="text-white/80 text-sm space-y-2">
          <p className="font-medium">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Minimum withdrawal: $50 worth of {network.toUpperCase()}</li>
            <li>Withdrawals typically process within 24 hours</li>
            <li>A 1% fee applies to all withdrawals</li>
            <li>Please double-check your wallet address</li>
          </ul>
        </div>
      </div>
    </form>
  );
};

export default WithdrawalForm;
