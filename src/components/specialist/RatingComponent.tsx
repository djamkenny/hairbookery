
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRatings } from "@/hooks/useRatings";

interface RatingComponentProps {
	specialistId: string;
	showSubmissionForm?: boolean;
}

const RatingComponent = ({ specialistId, showSubmissionForm = true }: RatingComponentProps) => {
	const { user } = useAuth();
	const { averageRating, totalRatings, userRating, loading, submitRating, fetchUserRating } = useRatings(specialistId);
	const [selectedRating, setSelectedRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);

	useEffect(() => {
		if (user?.id) {
			fetchUserRating(user.id);
		}
	}, [user?.id, specialistId]);

	useEffect(() => {
		if (userRating) {
			setSelectedRating(userRating.rating);
		}
	}, [userRating]);

	const handleRatingSubmit = async () => {
		if (!user?.id || selectedRating === 0) return;
		
		const success = await submitRating(selectedRating, user.id);
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

			{/* Rating Submission Form - Only for logged in users */}
			{showSubmissionForm && user && (
				<Card>
					<CardContent className="p-4">
						<h4 className="font-medium mb-3">
							{userRating ? "Update your rating" : "Rate this specialist"}
						</h4>
						<div className="space-y-3">
							<div className="flex gap-1">
								{renderStars(selectedRating, true, "h-6 w-6")}
							</div>
							<Button
								onClick={handleRatingSubmit}
								disabled={loading || selectedRating === 0}
								size="sm"
							>
								{loading ? "Submitting..." : userRating ? "Update Rating" : "Submit Rating"}
							</Button>
						</div>
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
		</div>
	);
};

export default RatingComponent;
