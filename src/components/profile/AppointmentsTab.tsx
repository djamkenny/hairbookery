
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarIcon, 
  ClockIcon,
  ClipboardList,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Appointment } from "@/types/appointment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AppointmentsTabProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  handleRescheduleAppointment: (id: string) => void;
  handleCancelAppointment: (id: string) => void;
}

const AppointmentsTab = ({ 
  upcomingAppointments, 
  pastAppointments, 
  handleRescheduleAppointment, 
  handleCancelAppointment 
}: AppointmentsTabProps) => {
  const isMobile = useIsMobile();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleBookSimilar = (appointment: Appointment) => {
    // Store appointment details in localStorage for booking form
    localStorage.setItem('similarBooking', JSON.stringify({
      service: appointment.service,
      stylist: appointment.stylist || '',
      notes: `Similar to previous appointment on ${appointment.date}`
    }));
    
    // Navigate to booking page
    window.location.href = '/booking';
  };

  const handleLeaveReview = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment || !comment.trim()) {
      toast.error("Please provide a comment for your review");
      return;
    }

    setSubmittingReview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit a review");
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            user_id: user.id,
            rating: rating,
            comment: comment.trim(),
          },
        ]);

      if (error) {
        console.error("Error submitting review:", error);
        toast.error("Failed to submit review");
      } else {
        toast.success("Review submitted successfully!");
        setReviewDialogOpen(false);
        setComment("");
        setRating(5);
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Your Appointments</h1>
      
      <Tabs defaultValue="upcoming" className="w-full overflow-hidden">
        <TabsList className="mb-4 md:mb-6 w-full overflow-x-auto hide-scrollbar">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-3 md:space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="border-l-4 border-primary p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-3 md:mb-4">
                      <div>
                        <h3 className="font-medium text-base md:text-lg">{appointment.service}</h3>
                        <p className="text-sm text-muted-foreground">With {appointment.stylist}</p>
                        {appointment.order_id && (
                          <div className="flex items-center mt-2 gap-2 p-1.5 bg-primary/5 rounded border border-primary/10 w-fit">
                            <ClipboardList className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-mono text-primary">{appointment.order_id}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <div className="flex items-center sm:justify-end text-xs md:text-sm font-medium mb-1">
                          <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center sm:justify-end text-xs md:text-sm text-muted-foreground">
                          <ClockIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size={isMobile ? "sm" : "sm"}
                        className="text-xs md:text-sm"
                        onClick={() => handleRescheduleAppointment(appointment.id)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "sm" : "sm"}
                        className="text-xs md:text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 md:py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4">You don't have any upcoming appointments.</p>
              <Link to="/booking">
                <Button size={isMobile ? "sm" : "default"}>Book an Appointment</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-3 md:space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-l-4 border-muted p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-3 md:mb-4">
                      <div>
                        <h3 className="font-medium text-base md:text-lg">{appointment.service}</h3>
                        <p className="text-sm text-muted-foreground">With {appointment.stylist}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <div className="flex items-center sm:justify-end text-xs md:text-sm font-medium mb-1">
                          <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center sm:justify-end text-xs md:text-sm text-muted-foreground">
                          <ClockIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size={isMobile ? "sm" : "sm"}
                        className="text-xs md:text-sm"
                        onClick={() => handleBookSimilar(appointment)}
                      >
                        Book Similar
                      </Button>
                      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size={isMobile ? "sm" : "sm"}
                            className="text-xs md:text-sm"
                            onClick={() => handleLeaveReview(appointment)}
                          >
                            Leave Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Leave a Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Service: {selectedAppointment?.service}
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                Specialist: {selectedAppointment?.stylist}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Rating</label>
                              <StarRating value={rating} onChange={setRating} />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Comment</label>
                              <Textarea
                                placeholder="Share your experience with this specialist..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full"
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={handleSubmitReview}
                                disabled={submittingReview || !comment.trim()}
                                className="flex-1"
                              >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setReviewDialogOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 md:py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-sm md:text-base">You don't have any past appointments.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsTab;
