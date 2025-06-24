
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface RevenueRecord {
  id: string;
  booking_fee: number;
  service_amount: number;
  total_revenue: number;
  revenue_date: string;
  created_at: string;
  stylist_id?: string;
  stylist_name?: string;
}

interface EarningsRecord {
  id: string;
  platform_fee: number;
  gross_amount: number;
  net_amount: number;
  created_at: string;
  stylist_id?: string;
  stylist_name?: string;
}

const RevenueHistory: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueRecord[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueHistory();
  }, []);

  const loadRevenueHistory = async () => {
    try {
      setLoading(true);
      
      // Get revenue tracking data
      const { data: revenue, error: revenueError } = await supabase
        .from('revenue_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (revenueError) {
        console.error('Error fetching revenue history:', revenueError);
      }

      // Get specialist earnings data
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('*')
        .order('created_at', { ascending: false });

      if (earningsError) {
        console.error('Error fetching earnings history:', earningsError);
      }

      // Get all profiles to map stylist names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      console.log('Revenue history data:', revenue);
      console.log('Earnings history data:', earnings);
      console.log('Profiles data:', profiles);

      // Create a map of stylist IDs to names
      const stylistNamesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          stylistNamesMap.set(profile.id, profile.full_name || 'Unknown');
        });
      }

      // Map revenue data with stylist names
      const mappedRevenueData = revenue?.map(r => ({
        ...r,
        stylist_name: stylistNamesMap.get(r.stylist_id) || 'Unknown'
      })) || [];

      // Map earnings data with stylist names
      const mappedEarningsData = earnings?.map(e => ({
        ...e,
        stylist_name: stylistNamesMap.get(e.stylist_id) || 'Unknown'
      })) || [];

      setRevenueData(mappedRevenueData);
      setEarningsData(mappedEarningsData);

    } catch (error) {
      console.error('Error loading revenue history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Tracking History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Tracking History</CardTitle>
          <CardDescription>Platform booking fees from completed appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stylist</TableHead>
                    <TableHead>Booking Fee</TableHead>
                    <TableHead>Service Amount</TableHead>
                    <TableHead>Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{record.stylist_name}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        GH₵{Number(record.booking_fee).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        GH₵{Number(record.service_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        GH₵{Number(record.total_revenue).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No revenue tracking records found</p>
              <p className="text-sm mt-2">Revenue tracking records are created when appointments are completed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialist Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Fees from Earnings</CardTitle>
          <CardDescription>Platform fees collected from stylist earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {earningsData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stylist</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earningsData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{record.stylist_name}</TableCell>
                      <TableCell>
                        GH₵{(Number(record.gross_amount) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        GH₵{(Number(record.platform_fee) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        GH₵{(Number(record.net_amount) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No earnings records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueHistory;
