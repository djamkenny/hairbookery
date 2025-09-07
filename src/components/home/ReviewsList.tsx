
import React, { useState } from "react";
import { Edit2, Trash2, Save, X } from "lucide-react";
import ReviewCard from "@/components/ui/ReviewCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/hooks/useReviews";

interface ReviewsListProps {
	reviews: Review[];
	loading: boolean;
	user: any;
	onEdit: (reviewId: string, editForm: { rating: number; comment: string }) => Promise<boolean>;
	onDelete: (reviewId: string) => Promise<boolean>;
}

const ReviewsList = ({ reviews, loading, user, onEdit, onDelete }: ReviewsListProps) => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState({
		rating: 5,
		comment: "",
	});

	const maxCommentLength = 500;

	// Remove debug logging in production

	const handleEditChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		
		// Limit comment length
		if (name === "comment" && value.length > maxCommentLength) {
			return;
		}
		
		setEditForm({ ...editForm, [name]: value });
	};

	const handleEdit = (review: Review) => {
		setEditingId(review.id);
		setEditForm({
			rating: review.rating,
			comment: review.comment,
		});
	};

	const handleSaveEdit = async (reviewId: string) => {
		const success = await onEdit(reviewId, editForm);
		if (success) {
			setEditingId(null);
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditForm({ rating: 5, comment: "" });
	};

	if (loading && reviews.length === 0) {
		return (
			<div className="col-span-2 text-center text-lg">
				Loading reviews...
			</div>
		);
	}

	if (reviews.length === 0) {
		return (
			<div className="col-span-2 text-center space-y-4">
				<p className="text-lg text-muted-foreground">No reviews yet.</p>
				{!user && (
					<p className="text-sm text-muted-foreground">
						Please log in to be the first to leave a review!
					</p>
				)}
			</div>
		);
	}

	return (
		<>
			{reviews.map((review, index) => (
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
								<div className="space-y-2">
									<Textarea
										name="comment"
										value={editForm.comment}
										onChange={handleEditChange}
										rows={4}
										className="w-full text-black bg-white border border-gray-300"
									/>
									<div className="text-right text-xs text-muted-foreground">
										{editForm.comment.length}/{maxCommentLength} characters
									</div>
								</div>
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
										onClick={() => onDelete(review.id)}
										className="h-8 w-8 p-0 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			))}
		</>
	);
};

export default ReviewsList;
