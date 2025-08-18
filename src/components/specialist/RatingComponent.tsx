
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRatings } from "@/hooks/useRatings";

interface RatingComponentProps {
	specialistId: string;
	showSubmissionForm?: boolean;
	showFeedbackList?: boolean;
}

const RatingComponent = ({ specialistId, showSubmissionForm = true, showFeedbackList = true }: RatingComponentProps) => {
	const { user } = useAuth();
	const { ratings, averageRating, totalRatings, userRating, loading, submitRating, fetchUserRating, canUserRate } = useRatings(specialistId);
	const [selectedRating, setSelectedRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const [userCanRate, setUserCanRate] = useState(false);
	const [checkingEligibility, setCheckingEligibility] = useState(false);
	const [comment, setComment] = useState("");

	useEffect(() => {
		if (user?.id) {
			fetchUserRating(user.id);
			
			// Check if user can rate this specialist
			const checkEligibility = async () => {
				setCheckingEligibility(true);
				const eligible = await canUserRate(user.id);
				setUserCanRate(eligible);
				setCheckingEligibility(false);
			};
			
			checkEligibility();
		}
	}, [user?.id, specialistId]);

	useEffect(() => {
		if (userRating) {
			setSelectedRating(userRating.rating);
			setComment(userRating.comment || "");
		}
	}, [userRating]);

	const handleRatingSubmit = async () => {
		if (!user?.id || selectedRating === 0) return;
		
		const success = await submitRating(selectedRating, user.id, comment.trim() || undefined);
		if (success) {
			// Rating submitted successfully
		}
	};

	const renderStars = (rating: number, interactive: boolean = false, size: string = "h-5 w-5") => {
		return Array(5).fill(0).map((_, index) => {
			const starValue = index + 1;
			const isFilled = interactive 
				? (hoveredRating || selectedRating) >= starValue
				: rating >= starValue;
			
			return (
				<Star
					key={index}
					className={`${size} cursor-${interactive ? 'pointer' : 'default'} transition-colors ${
						isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
					}`}
					onClick={() => interactive && setSelectedRating(starValue)}
					onMouseEnter={() => interactive && setHoveredRating(starValue)}
					onMouseLeave={() => interactive && setHoveredRating(0)}
				/>
			);
		});
	};

	return (
		<div className="space-y-4">
			{/* Display Average Rating */}
			<div className="flex items-center gap-2">
				<div className="flex">
					{renderStars(averageRating)}
				</div>
				<span className="text-sm text-muted-foreground">
					{totalRatings > 0 
						? `${averageRating} (${totalRatings} rating${totalRatings > 1 ? 's' : ''})`
						: "No ratings yet"
					}
				</span>
			</div>

			{/* Rating Submission Form - Only for eligible users */}
			{showSubmissionForm && user && (
				<Card>
					<CardContent className="p-4">
						{checkingEligibility ? (
							<div className="text-center p-4">
								<p className="text-sm text-muted-foreground">Checking eligibility...</p>
							</div>
						) : userCanRate ? (
							<div>
								<h4 className="font-medium mb-3">
									{userRating ? "Update your rating" : "Rate this specialist"}
								</h4>
								<div className="space-y-3">
									<div className="flex gap-1">
										{renderStars(selectedRating, true, "h-6 w-6")}
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Your feedback (optional)</label>
										<Textarea
											placeholder="Share your experience..."
											value={comment}
											onChange={(e) => setComment(e.target.value)}
											className="min-h-[60px] resize-none"
											maxLength={500}
										/>
										{comment.length > 0 && (
											<div className="text-xs text-muted-foreground text-right">
												{comment.length}/500 characters
											</div>
										)}
									</div>
									<Button
										onClick={handleRatingSubmit}
										disabled={loading || selectedRating === 0}
										size="sm"
									>
										{loading ? "Submitting..." : userRating ? "Update Rating" : "Submit Rating"}
									</Button>
								</div>
							</div>
						) : (
							<div className="text-center p-4 bg-muted/30 rounded-lg">
								<p className="text-sm text-muted-foreground">
									You can only rate specialists after completing a service with them.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Login prompt for non-authenticated users */}
			{showSubmissionForm && !user && (
				<div className="text-center p-4 bg-muted/30 rounded-lg">
					<p className="text-sm text-muted-foreground">
						Please log in to rate this specialist.
					</p>
				</div>
			)}

			{/* Feedback List */}
			{showFeedbackList && ratings.length > 0 && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="text-lg">Client Feedback</CardTitle>
					</CardHeader>
					<CardContent>
						{ratings.filter(rating => rating.comment && rating.comment.trim().length > 0).length > 0 ? (
							<div className="overflow-x-auto">
								<div className="flex gap-4 pb-4">
									{ratings
										.filter(rating => rating.comment && rating.comment.trim().length > 0)
										.slice(0, 10) // Show up to 10 feedback comments
										.map((rating) => (
											<div key={rating.id} className="flex-none w-80 p-4 border border-border rounded-lg bg-card">
												<div className="flex items-center gap-2 mb-3">
													<div className="flex">
														{renderStars(rating.rating, false, "h-4 w-4")}
													</div>
													<span className="text-sm text-muted-foreground">
														{new Date(rating.created_at).toLocaleDateString()}
													</span>
												</div>
												<p className="text-sm text-muted-foreground leading-relaxed">{rating.comment}</p>
											</div>
										))}
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">
								No feedback comments yet.
							</p>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default RatingComponent;
