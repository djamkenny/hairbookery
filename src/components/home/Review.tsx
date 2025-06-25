
import React from "react";
import ReviewSubmissionForm from "./ReviewSubmissionForm";
import ReviewsList from "./ReviewsList";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";

const gradientTextStyle: React.CSSProperties = {
	background: "linear-gradient(90deg,rgb(56, 59, 62) 0%, #38e8c3 100%)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
};

const Reviews = () => {
	const { user } = useAuth();
	const { reviews, loading, submitReview, editReview, removeReview } = useReviews(); // No stylistId for homepage

	const handleSubmitReview = async (form: { rating: number; comment: string }) => {
		return await submitReview(form, user?.id); // No stylistId for general reviews
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
						about their experiences with our services.
					</p>
				</div>

				{/* Review Submission Form - Only show if user is logged in */}
				{user && (
					<ReviewSubmissionForm
						onSubmit={handleSubmitReview}
						loading={loading}
					/>
				)}

				{/* Reviews Display - Always visible to everyone */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<ReviewsList
						reviews={reviews}
						loading={loading}
						user={user}
						onEdit={editReview}
						onDelete={removeReview}
					/>
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
