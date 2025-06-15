import React from "react";

interface EarningsOverviewProps {
  availableBalance: number;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount: number;
  totalRevenue?: number; // New optional prop
}

const EarningsOverview = ({
  availableBalance,
  totalEarnings,
  pendingEarnings,
  withdrawnAmount,
  totalRevenue
}: EarningsOverviewProps) => {
  const formatAmount = (amount: number) => `GH₵${(amount / 100).toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-green-50 border-2 border-green-100 rounded-xl p-4">
        <div className="text-green-600 text-xs font-semibold">Available Balance</div>
        <div className="text-2xl font-bold text-green-800">{formatAmount(availableBalance)}</div>
      </div>
      <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
        <div className="text-blue-600 text-xs font-semibold">Total Net Earnings</div>
        <div className="text-2xl font-bold text-blue-800">{formatAmount(totalEarnings)}</div>
      </div>
      <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4">
        <div className="text-gray-600 text-xs font-semibold">Pending Earnings</div>
        <div className="text-2xl font-bold text-gray-800">{formatAmount(pendingEarnings)}</div>
      </div>
      <div className="bg-yellow-50 border-2 border-yellow-100 rounded-xl p-4">
        <div className="text-yellow-600 text-xs font-semibold">Withdrawn Amount</div>
        <div className="text-2xl font-bold text-yellow-800">{formatAmount(withdrawnAmount)}</div>
      </div>
      {typeof totalRevenue === "number" && (
        <div className="bg-purple-50 border-2 border-purple-100 rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-4">
          <div className="text-purple-600 text-xs font-semibold">Total Revenue (All Client Payments)</div>
          <div className="text-2xl font-bold text-purple-800">{formatAmount(totalRevenue)}</div>
        </div>
      )}
    </div>
  );
};

export default EarningsOverview;
