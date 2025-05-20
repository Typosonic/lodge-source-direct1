
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "purchase";
  amount: number;
  status: "pending" | "completed" | "failed";
  date: string;
  details: string;
  network?: string;
  txHash?: string;
};

// Define the database transaction type to match what's actually in the database
type DatabaseTransaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  reference: string | null;
  user_id: string;
  network: string | null;
  tx_hash: string | null;
};

export async function getUserTransactions(): Promise<Transaction[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // Fetch transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    
    // Format transactions to match our Transaction type
    const formattedTransactions: Transaction[] = (transactions as DatabaseTransaction[]).map(tx => ({
      id: tx.id,
      type: tx.type as "deposit" | "withdrawal" | "purchase",
      amount: Number(tx.amount),
      status: tx.status as "pending" | "completed" | "failed",
      date: tx.created_at,
      details: tx.reference || tx.type,
      // Only add network and txHash if they exist in the database record
      ...(tx.network && { network: tx.network }),
      ...(tx.tx_hash && { txHash: tx.tx_hash })
    }));
    
    return formattedTransactions;
  } catch (error) {
    console.error("Error in getUserTransactions:", error);
    return [];
  }
}

export async function getUserWalletBalance(): Promise<number> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // Fetch user profile to get wallet balance
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.user.id)
      .single();
    
    if (error) {
      console.error("Error fetching wallet balance:", error);
      return 0;
    }
    
    return Number(profile.wallet_balance || 0);
  } catch (error) {
    console.error("Error in getUserWalletBalance:", error);
    return 0;
  }
}

export async function createDeposit(
  amount: number, 
  network: string, 
  txHash?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // Create a new transaction record with network and tx_hash columns
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.user.id,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        reference: `${network} Deposit`,
        network: network,
        tx_hash: txHash
      });
    
    if (txError) {
      throw txError;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error creating deposit:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create deposit" 
    };
  }
}

export async function createWithdrawal(
  amount: number,
  address: string,
  network: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // First check if user has sufficient balance
    const currentBalance = await getUserWalletBalance();
    
    if (currentBalance < amount) {
      return {
        success: false,
        error: "Insufficient balance for withdrawal"
      };
    }
    
    // Create a new withdrawal transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.user.id,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        reference: `Withdrawal to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        network: network
      });
    
    if (txError) {
      throw txError;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error creating withdrawal:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create withdrawal" 
    };
  }
}

// Function to update wallet balance (for admin use only)
export async function updateWalletBalance(userId: string, newBalance: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }
}

// Function to get transaction by ID
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    const tx = data as DatabaseTransaction;
    
    return {
      id: tx.id,
      type: tx.type as "deposit" | "withdrawal" | "purchase",
      amount: Number(tx.amount),
      status: tx.status as "pending" | "completed" | "failed",
      date: tx.created_at,
      details: tx.reference || tx.type,
      ...(tx.network && { network: tx.network }),
      ...(tx.tx_hash && { txHash: tx.tx_hash })
    };
  } catch (error) {
    console.error("Error getting transaction by ID:", error);
    return null;
  }
}
