import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Save, X } from "lucide-react";
import ReviewCard from "@/components/ui/ReviewCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const gradientTextStyle: React.CSSProperties = {
	background: "linear-gradient(90deg,rgb(56, 59, 62) 0%, #38e8c3 100%)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
};

type Review = {
	id: string;
	user_id: string;
	rating: number;
	comment: string;
	created_at: string;
	updated_at: string;
	user_profile?: {
		full_name?: string;
		avatar_url?: string;
	};
};

const Reviews = () => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [user, setUser] = useState<any>(null);
	const [form, setForm] = useState({
		rating: 5,
		comment: "",
	});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState({
		rating: 5,
		comment: "",
	});
	const [loading, setLoading] = useState(false);

	// Check authentication state
	useEffect(() => {
		const checkAuth = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setUser(session?.user || null);
		};
		checkAuth();

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user || null);
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	// Fetch reviews from Supabase on mount - NO authentication required for viewing
	useEffect(() => {
		const fetchReviews = async () => {
			setLoading(true);
			try {
				// Create a temporary client without authentication requirements for public data
				const { data, error } = await supabase
					.from("reviews")
					.select(`
						*,
						user_profile:profiles(full_name, avatar_url)
					`)
					.order("created_at", { ascending: false });
				
				if (error) {
					console.error("Error fetching reviews:", error);
					// Don't show error toast for public viewing, just log it
					console.log("Reviews fetch error details:", error);
				} else if (data) {
					setReviews(data as Review[]);
				}
			} catch (error) {
				console.error("Error fetching reviews:", error);
				// Don't show error toast for public viewing
				console.log("Reviews fetch catch error:", error);
			}
			setLoading(false);
		};
		
		// Always fetch reviews regardless of authentication status
		fetchReviews();
	}, []); // Remove user dependency to ensure reviews load for everyone

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleEditChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.comment || !user) {
			toast.error("Please log in to submit a review");
			return;
		}
		
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("reviews")
				.insert([
					{
						user_id: user.id,
						rating: Number(form.rating),
						comment: form.comment,
					},
				])
				.select(`
					*,
					user_profile:profiles(full_name, avatar_url)
				`);
			
			if (error) {
				console.error("Error submitting review:", error);
				toast.error("Failed to submit review");
			} else if (data && data.length > 0) {
				setReviews([data[0] as Review, ...reviews]);
				setForm({ rating: 5, comment: "" });
				toast.success("Review submitted successfully!");
			}
		} catch (error) {
			console.error("Error submitting review:", error);
			toast.error("Failed to submit review");
		}
		setLoading(false);
	};

	const handleEdit = (review: Review) => {
		setEditingId(review.id);
		setEditForm({
			rating: review.rating,
			comment: review.comment,
		});
	};

	const handleSaveEdit = async (reviewId: string) => {
		if (!editForm.comment) return;
		
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
			} else {
				setReviews(reviews.map(review => 
					review.id === reviewId 
						? { ...review, rating: Number(editForm.rating), comment: editForm.comment }
						: review
				));
				setEditingId(null);
				toast.success("Review updated successfully!");
			}
		} catch (error) {
			console.error("Error updating review:", error);
			toast.error("Failed to update review");
		}
		setLoading(false);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditForm({ rating: 5, comment: "" });
	};

	const handleDelete = async (reviewId: string) => {
		if (!confirm("Are you sure you want to delete this review?")) return;
		
		setLoading(true);
		try {
			const { error } = await supabase
				.from("reviews")
				.delete()
				.eq("id", reviewId);
			
			if (error) {
				console.error("Error deleting review:", error);
				toast.error("Failed to delete review");
			} else {
				setReviews(reviews.filter(review => review.id !== reviewId));
				toast.success("Review deleted successfully!");
			}
		} catch (error) {
			console.error("Error deleting review:", error);
			toast.error("Failed to delete review");
		}
		setLoading(false);
	};

	return (
		<section id="reviews" className="py-20 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center max-w-xl mx-auto mb-12">
					<h2
						className="text-3xl md:text-4xl font-semibold mb-4"
						style={gradientTextStyle}
					>
						What Our Clients Say
					</h2>
					<p className="text-foreground">
						Don't just take our word for it. Here's what our clients have to say
						about their experiences with our stylists.
					</p>
				</div>

				{/* Review Submission Form - Only show if user is logged in */}
				{user && (
					<form
						onSubmit={handleSubmit}
						className="max-w-xl mx-auto mb-10 bg-white rounded-lg shadow p-6 space-y-4 border"
					>
						<h3 className="text-lg font-semibold text-black">Leave a Review</h3>
						<select
							name="rating"
							value={form.rating}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2 bg-white text-black"
							required
						>
							{[5, 4, 3, 2, 1].map((r) => (
								<option key={r} value={r}>
									{r} Star{r > 1 ? "s" : ""}
								</option>
							))}
						</select>
						<Textarea
							name="comment"
							placeholder="Share your experience..."
							value={form.comment}
							onChange={handleChange}
							required
							rows={4}
							className="w-full text-black placeholder:text-gray-500 bg-white border border-gray-300"
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={loading}
						>
							{loading ? "Submitting..." : "Submit Review"}
						</Button>
					</form>
				)}

				{/* Reviews Display - Always visible to everyone */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{loading && reviews.length === 0 ? (
						<div className="col-span-2 text-center text-lg">
							Loading reviews...
						</div>
					) : reviews.length > 0 ? (
						reviews.map((review, index) => (
							<div key={review.id} className="relative">
								{editingId === review.id ? (
									<div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
										<div className="space-y-4">
											<select
												name="rating"
												value={editForm.rating}
												onChange={handleEditChange}
												className="w-full border rounded px-3 py-2 text-black bg-white"
											>
												{[5, 4, 3, 2, 1].map((r) => (
													<option key={r} value={r}>
														{r} Star{r > 1 ? "s" : ""}
													</option>
												))}
											</select>
											<Textarea
												name="comment"
												value={editForm.comment}
												onChange={handleEditChange}
												rows={4}
												className="w-full text-black bg-white border border-gray-300"
											/>
											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() => handleSaveEdit(review.id)}
													disabled={loading}
												>
													<Save className="h-4 w-4 mr-1" />
													Save
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={handleCancelEdit}
												>
													<X className="h-4 w-4 mr-1" />
													Cancel
												</Button>
											</div>
										</div>
									</div>
								) : (
									<>
										<ReviewCard
											name={review.user_profile?.full_name || "Anonymous User"}
											date={new Date(review.created_at).toLocaleDateString()}
											rating={review.rating}
											comment={review.comment}
											image={review.user_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_profile?.full_name || "Anonymous")}`}
											className="animate-fade-in"
											style={{ animationDelay: `${index * 0.1}s` }}
										/>
										{user && review.user_id === user.id && (
											<div className="absolute top-4 right-4 flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleEdit(review)}
													className="h-8 w-8 p-0"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDelete(review.id)}
													className="h-8 w-8 p-0 text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										)}
									</>
								)}
							</div>
						))
					) : (
						<div className="col-span-2 text-center space-y-4">
							<p className="text-lg text-muted-foreground">No reviews yet.</p>
							{!user && (
								<p className="text-sm text-muted-foreground">
									Please log in to be the first to leave a review!
								</p>
							)}
						</div>
					)}
				</div>

				{/* Login prompt for non-authenticated users at the bottom */}
				{!user && (
					<div className="text-center mt-8 p-6 bg-muted/30 rounded-lg">
						<p className="text-muted-foreground mb-2">
							Want to share your experience?
						</p>
						<p className="text-sm text-muted-foreground">
							Please log in to submit a review.
						</p>
					</div>
				)}
			</div>
		</section>
	);
};

export default Reviews;
