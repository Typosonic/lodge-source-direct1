import { ExternalLink } from "lucide-react";
import type { Transaction } from "@/services/transactionService";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionList = ({ transactions, isLoading = false }: TransactionListProps) => {
  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-white";
    }
  };
  
  const getAmountColor = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "text-green-400";
      case "withdrawal":
      case "purchase":
        return "text-red-400";
      default:
        return "text-white";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const truncateHash = (hash: string | undefined) => {
    if (!hash) return "";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-10 animate-pulse bg-white/10 rounded"></div>
        <div className="h-10 animate-pulse bg-white/10 rounded"></div>
        <div className="h-10 animate-pulse bg-white/10 rounded"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Transaction</th>
            <th className="text-left py-3 px-4 font-medium">Network</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-right py-3 px-4 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 px-4 text-sm text-white/60">{formatDate(tx.date)}</td>
              <td className="py-3 px-4">
                <div className="font-medium">{tx.details}</div>
                {tx.txHash && (
                  <div className="text-xs text-white/60 flex items-center gap-1 mt-1">
                    <span>{truncateHash(tx.txHash)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-white/80">{tx.network || "--"}</td>
              <td className="py-3 px-4">
                <span className={`text-sm ${getStatusColor(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-medium">
                <span className={getAmountColor(tx.type)}>
                  {tx.type === "deposit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
