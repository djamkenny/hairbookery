
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Rating = {
	id: string;
	user_id: string;
	specialist_id: string;
	rating: number;
	created_at: string;
	updated_at: string;
};

export const useRatings = (specialistId?: string) => {
	const [ratings, setRatings] = useState<Rating[]>([]);
	const [averageRating, setAverageRating] = useState(0);
	const [totalRatings, setTotalRatings] = useState(0);
	const [userRating, setUserRating] = useState<Rating | null>(null);
	const [loading, setLoading] = useState(false);

	// Fetch ratings for a specialist
	const fetchRatings = async () => {
		if (!specialistId) return;
		
		setLoading(true);
		try {
			console.log("Fetching ratings for specialist:", specialistId);
			
			const { data, error } = await supabase
				.from("specialist_ratings")
				.select("*")
				.eq('specialist_id', specialistId)
				.order("created_at", { ascending: false });
			
			if (error) {
				console.error("Error fetching ratings:", error);
			} else if (data) {
				console.log("Fetched ratings:", data);
				setRatings(data as Rating[]);
				
				// Calculate average rating
				if (data.length > 0) {
					const avg = data.reduce((sum, rating) => sum + rating.rating, 0) / data.length;
					setAverageRating(Math.round(avg * 10) / 10);
					setTotalRatings(data.length);
				} else {
					setAverageRating(0);
					setTotalRatings(0);
				}
			}
		} catch (error) {
			console.error("Error fetching ratings:", error);
		}
		setLoading(false);
	};

	// Fetch user's existing rating for this specialist
	const fetchUserRating = async (userId: string) => {
		if (!specialistId || !userId) return;
		
		try {
			const { data, error } = await supabase
				.from("specialist_ratings")
				.select("*")
				.eq('specialist_id', specialistId)
				.eq('user_id', userId)
				.maybeSingle();
			
			if (error) {
				console.error("Error fetching user rating:", error);
			} else if (data) {
				setUserRating(data as Rating);
			}
		} catch (error) {
			console.error("Error fetching user rating:", error);
		}
	};

	useEffect(() => {
		fetchRatings();
	}, [specialistId]);

	const submitRating = async (rating: number, userId: string) => {
		if (!specialistId || !userId) {
			toast.error("Please log in to submit a rating");
			return false;
		}
		
		setLoading(true);
		try {
			console.log("Submitting rating:", { rating, userId, specialistId });
			
			// Check if user already rated this specialist
			const { data: existingRating } = await supabase
				.from("specialist_ratings")
				.select("*")
				.eq('specialist_id', specialistId)
				.eq('user_id', userId)
				.maybeSingle();
			
			if (existingRating) {
				// Update existing rating
				const { data, error } = await supabase
					.from("specialist_ratings")
					.update({ rating: rating })
					.eq('id', existingRating.id)
					.select()
					.single();
				
				if (error) {
					console.error("Error updating rating:", error);
					toast.error("Failed to update rating");
					return false;
				} else {
					setUserRating(data as Rating);
					toast.success("Rating updated successfully!");
					fetchRatings(); // Refresh ratings
					return true;
				}
			} else {
				// Create new rating
				const { data, error } = await supabase
					.from("specialist_ratings")
					.insert([
						{
							user_id: userId,
							specialist_id: specialistId,
							rating: rating,
						},
					])
					.select()
					.single();
				
				if (error) {
					console.error("Error submitting rating:", error);
					toast.error("Failed to submit rating");
					return false;
				} else {
					setUserRating(data as Rating);
					toast.success("Rating submitted successfully!");
					fetchRatings(); // Refresh ratings
					return true;
				}
			}
		} catch (error) {
			console.error("Error submitting rating:", error);
			toast.error("Failed to submit rating");
			return false;
		} finally {
			setLoading(false);
		}
	};

	return {
		ratings,
		averageRating,
		totalRatings,
		userRating,
		loading,
		submitRating,
		fetchUserRating,
	};
};
