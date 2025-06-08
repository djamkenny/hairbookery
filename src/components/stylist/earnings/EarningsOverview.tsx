
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface EarningsOverviewProps {
  availableBalance: number;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount: number;
}

const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  availableBalance,
  totalEarnings,
  pendingEarnings,
  withdrawnAmount
}) => {
  const formatAmount = (amount: number) => `GH₵${(amount / 100).toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatAmount(availableBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(totalEarnings)}</div>
          <p className="text-xs text-muted-foreground">All time earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatAmount(pendingEarnings)}
          </div>
          <p className="text-xs text-muted-foreground">Processing earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
          <CheckCircle className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(withdrawnAmount)}</div>
          <p className="text-xs text-muted-foreground">Successfully withdrawn</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsOverview;
