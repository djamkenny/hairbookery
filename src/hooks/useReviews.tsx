
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Review = {
	id: string;
	user_id: string;
	rating: number;
	comment: string;
	created_at: string;
	updated_at: string;
	stylist_id?: string | null;
	user_profile?: {
		full_name?: string;
		avatar_url?: string;
	};
};

export const useReviews = (stylistId?: string) => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);

	// Fetch reviews from Supabase - NO authentication required for viewing
	const fetchReviews = async () => {
		setLoading(true);
		try {
			console.log("Fetching reviews for stylistId:", stylistId);
			
			let query = supabase
				.from("reviews")
				.select(`
					*,
					user_profile:profiles(full_name, avatar_url)
				`)
				.order("created_at", { ascending: false });

			// If stylistId is provided, filter for that stylist
			if (stylistId) {
				query = query.eq('stylist_id', stylistId);
				console.log("Filtering reviews for specific stylist:", stylistId);
			} else {
				// For homepage, show general reviews (not tied to specific stylists)
				query = query.is('stylist_id', null);
				console.log("Fetching general reviews for homepage");
			}
			
			const { data, error } = await query;
			
			if (error) {
				console.error("Error fetching reviews:", error);
				console.log("Reviews fetch error details:", error);
			} else if (data) {
				console.log("Fetched reviews:", data);
				setReviews(data as Review[]);
			}
		} catch (error) {
			console.error("Error fetching reviews:", error);
			console.log("Reviews fetch catch error:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchReviews();
	}, [stylistId]);

	const addReview = (newReview: Review) => {
		setReviews([newReview, ...reviews]);
	};

	const updateReview = (reviewId: string, updatedData: { rating: number; comment: string }) => {
		setReviews(reviews.map(review => 
			review.id === reviewId 
				? { ...review, rating: updatedData.rating, comment: updatedData.comment }
				: review
		));
	};

	const deleteReview = (reviewId: string) => {
		setReviews(reviews.filter(review => review.id !== reviewId));
	};

	const submitReview = async (form: { rating: number; comment: string }, userId: string, targetStylistId?: string) => {
		if (!form.comment || !userId) {
			toast.error("Please log in to submit a review");
			return false;
		}
		
		setLoading(true);
		try {
			console.log("Submitting review:", { form, userId, targetStylistId });
			
			const { data, error } = await supabase
				.from("reviews")
				.insert([
					{
						user_id: userId,
						rating: Number(form.rating),
						comment: form.comment,
						stylist_id: targetStylistId || null,
					},
				])
				.select(`
					*,
					user_profile:profiles(full_name, avatar_url)
				`);
			
			if (error) {
				console.error("Error submitting review:", error);
				toast.error("Failed to submit review");
				return false;
			} else if (data && data.length > 0) {
				console.log("Review submitted successfully:", data[0]);
				addReview(data[0] as Review);
				toast.success("Review submitted successfully!");
				return true;
			}
		} catch (error) {
			console.error("Error submitting review:", error);
			toast.error("Failed to submit review");
			return false;
		}
		setLoading(false);
		return false;
	};

	const editReview = async (reviewId: string, editForm: { rating: number; comment: string }) => {
		if (!editForm.comment) return false;
		
		setLoading(true);
		try {
			const { error } = await supabase
				.from("reviews")
				.update({
					rating: Number(editForm.rating),
					comment: editForm.comment,
				})
				.eq("id", reviewId);
			
			if (error) {
				console.error("Error updating review:", error);
				toast.error("Failed to update review");
				return false;
			} else {
				updateReview(reviewId, editForm);
				toast.success("Review updated successfully!");
				return true;
			}
		} catch (error) {
			console.error("Error updating review:", error);
			toast.error("Failed to update review");
			return false;
		}
		setLoading(false);
	};

	const removeReview = async (reviewId: string) => {
		if (!confirm("Are you sure you want to delete this review?")) return false;
		
		setLoading(true);
		try {
			const { error } = await supabase
				.from("reviews")
				.delete()
				.eq("id", reviewId);
			
			if (error) {
				console.error("Error deleting review:", error);
				toast.error("Failed to delete review");
				return false;
			} else {
				deleteReview(reviewId);
				toast.success("Review deleted successfully!");
				return true;
			}
		} catch (error) {
			console.error("Error deleting review:", error);
			toast.error("Failed to delete review");
			return false;
		}
		setLoading(false);
	};

	return {
		reviews,
		loading,
		submitReview,
		editReview,
		removeReview,
	};
};
