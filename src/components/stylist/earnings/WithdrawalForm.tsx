
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalFormProps {
  availableBalance: number;
  onSuccess: () => void;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ availableBalance, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatAmount = (amount: number) => `GH₵${(amount / 100).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const withdrawalAmount = parseFloat(amount) * 100; // Convert to pesewas
    
    if (withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error("Withdrawal amount exceeds available balance");
      return;
    }

    if (withdrawalAmount < 500) { // Minimum 5 GHS
      toast.error("Minimum withdrawal amount is GH₵5.00");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      // Use RPC call to insert withdrawal request
      const { data, error } = await supabase.rpc('create_withdrawal_request', {
        p_stylist_id: user.id,
        p_amount: withdrawalAmount,
        p_bank_name: bankName,
        p_account_number: accountNumber,
        p_account_name: accountName,
        p_notes: notes || null
      });

      if (error) {
        console.error("Withdrawal request error:", error);
        toast.error("Failed to submit withdrawal request. Please try again.");
        return;
      }

      toast.success("Withdrawal request submitted successfully");
      
      // Reset form
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setNotes("");
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ghanaianBanks = [
    "Absa Bank Ghana",
    "Access Bank Ghana",
    "Agricultural Development Bank",
    "CalBank",
    "Consolidated Bank Ghana",
    "Ecobank Ghana",
    "Fidelity Bank Ghana",
    "First Atlantic Bank",
    "First National Bank Ghana",
    "GCB Bank",
    "Guaranty Trust Bank Ghana",
    "National Investment Bank",
    "Prudential Bank",
    "Republic Bank Ghana",
    "Société Générale Ghana",
    "Stanbic Bank Ghana",
    "Standard Chartered Bank Ghana",
    "United Bank for Africa Ghana",
    "Universal Merchant Bank",
    "Zenith Bank Ghana"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Available balance: {formatAmount(availableBalance)}
        </p>
      </CardHeader>
      <CardContent>
        {availableBalance < 500 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">Insufficient balance for withdrawal</p>
            <p className="text-sm text-muted-foreground">
              You need at least GH₵5.00 to make a withdrawal request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (GHS) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="5"
                max={availableBalance / 100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: GH₵5.00 | Maximum: {formatAmount(availableBalance)}
              </p>
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name *</Label>
              <Select value={bankName} onValueChange={setBankName} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {ghanaianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information (optional)"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalForm;
