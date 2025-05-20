import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface WalletBalanceProps {
  balance: number;
  onWithdraw?: () => void;
}

const WalletBalance = ({ balance, onWithdraw }: WalletBalanceProps) => {
  return (
    <Card className="bg-lodge-card-bg border-white/10">
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
        <CardDescription>Your current available balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
            <p className="text-white/60 text-sm">Available for purchases</p>
          </div>
          {onWithdraw ? (
            <GradientButton onClick={onWithdraw}>Withdraw Funds</GradientButton>
          ) : (
            <GradientButton asChild className="w-full">
              <Link to="/wallet" className="flex items-center justify-center gap-2 w-full">
                <Plus className="w-4 h-4" />
                <span>Top Up Balance</span>
              </Link>
            </GradientButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
