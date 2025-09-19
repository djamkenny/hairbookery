
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

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
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		
		// Limit comment length
		if (name === "comment" && value.length > maxCommentLength) {
			return;
		}
		
		setForm({ ...form, [name]: value });
	};

	const handleRatingChange = (value: string) => {
		setForm({ ...form, rating: parseInt(value) });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await onSubmit(form);
		if (success) {
			setForm({ rating: 5, comment: "" });
		}
	};

	return (
		<Card className="max-w-xl mx-auto mb-10 shadow-lg border-0 bg-gradient-to-br from-card to-card/50 animate-fade-in">
			<CardHeader className="text-center pb-4">
				<h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
					<Star className="w-6 h-6 text-primary fill-primary" />
					Leave a Review
				</h3>
				<p className="text-sm text-muted-foreground mt-2">
					Share your experience with our community
				</p>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Star Rating Selection */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">Rating</label>
						<Select value={form.rating.toString()} onValueChange={handleRatingChange}>
							<SelectTrigger className="w-full h-12 text-left bg-background border-2 border-border/50 hover:border-primary/50 transition-colors focus:border-primary">
								<SelectValue placeholder="Select rating">
									<div className="flex items-center gap-2">
										<div className="flex">
											{Array.from({ length: form.rating }, (_, i) => (
												<Star key={i} className="w-4 h-4 text-primary fill-primary" />
											))}
											{Array.from({ length: 5 - form.rating }, (_, i) => (
												<Star key={i + form.rating} className="w-4 h-4 text-muted-foreground" />
											))}
										</div>
										<span className="text-foreground font-medium">
											{form.rating} Star{form.rating > 1 ? "s" : ""}
										</span>
									</div>
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="bg-popover border-border shadow-lg">
								{[5, 4, 3, 2, 1].map((rating) => (
									<SelectItem key={rating} value={rating.toString()} className="cursor-pointer hover:bg-accent">
										<div className="flex items-center gap-2">
											<div className="flex">
												{Array.from({ length: rating }, (_, i) => (
													<Star key={i} className="w-4 h-4 text-primary fill-primary" />
												))}
												{Array.from({ length: 5 - rating }, (_, i) => (
													<Star key={i + rating} className="w-4 h-4 text-muted-foreground" />
												))}
											</div>
											<span>{rating} Star{rating > 1 ? "s" : ""}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Comment Textarea */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">Your Experience</label>
						<div className="relative">
							<Textarea
								name="comment"
								placeholder="Share your experience..."
								value={form.comment}
								onChange={handleChange}
								required
								rows={5}
								className="w-full resize-none bg-background border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground/70 text-foreground p-4 rounded-lg"
							/>
							<div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
								{form.comment.length}/{maxCommentLength}
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
						disabled={loading || !form.comment.trim()}
					>
						{loading ? (
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
								Submitting Review...
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Star className="w-4 h-4" />
								Submit Review
							</div>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default ReviewSubmissionForm;
