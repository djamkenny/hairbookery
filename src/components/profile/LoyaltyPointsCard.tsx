
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarIcon, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LoyaltyPoint {
  id: string;
  points: number;
  earned_from: string;
  created_at: string;
  appointment_id?: string;
}

interface LoyaltyPointsCardProps {
  totalPoints: number;
}

const LoyaltyPointsCard = ({ totalPoints }: LoyaltyPointsCardProps) => {
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyHistory();
  }, []);

  const fetchLoyaltyHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching loyalty history:', error);
        return;
      }

      setLoyaltyHistory(data || []);
    } catch (error) {
      console.error('Error in fetchLoyaltyHistory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-yellow-500" />
          Loyalty Points
          <Badge variant="secondary" className="ml-auto">
            {totalPoints} points
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted h-12 rounded" />
            ))}
          </div>
        ) : loyaltyHistory.length > 0 ? (
          <div className="space-y-3">
            {loyaltyHistory.map((point) => (
              <div key={point.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{point.earned_from}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {new Date(point.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  +{point.points} pts
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <StarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No loyalty points earned yet.</p>
            <p className="text-xs mt-1">Complete appointments to earn points!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
