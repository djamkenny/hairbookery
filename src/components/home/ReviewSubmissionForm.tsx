
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewSubmissionFormProps {
	onSubmit: (form: { rating: number; comment: string }) => Promise<boolean>;
	loading: boolean;
}

const ReviewSubmissionForm = ({ onSubmit, loading }: ReviewSubmissionFormProps) => {
	const [form, setForm] = useState({
		rating: 5,
		comment: "",
	});

	const maxCommentLength = 500;

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		
		// Limit comment length
		if (name === "comment" && value.length > maxCommentLength) {
			return;
		}
		
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await onSubmit(form);
		if (success) {
			setForm({ rating: 5, comment: "" });
		}
	};

	return (
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
			<div className="space-y-2">
				<Textarea
					name="comment"
					placeholder="Share your experience..."
					value={form.comment}
					onChange={handleChange}
					required
					rows={4}
					className="w-full text-black placeholder:text-gray-500 bg-white border border-gray-300"
				/>
				<div className="text-right text-xs text-muted-foreground">
					{form.comment.length}/{maxCommentLength} characters
				</div>
			</div>
			<Button
				type="submit"
				className="w-full"
				disabled={loading}
			>
				{loading ? "Submitting..." : "Submit Review"}
			</Button>
		</form>
	);
};

export default ReviewSubmissionForm;
