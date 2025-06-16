import React, { useState } from "react";
import ReviewCard from "@/components/ui/ReviewCard";

const initialReviews = [];

const gradientTextStyle: React.CSSProperties = {
	background: "linear-gradient(90deg, #4f8cff 0%, #38e8c3 100%)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
};

const Reviews = () => {
	const [reviews, setReviews] = useState(initialReviews);
	const [form, setForm] = useState({
		name: "",
		rating: 5,
		comment: "",
		image: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.comment) return;
		setReviews([
			{
				id: reviews.length + 1,
				name: form.name || "Anonymous",
				date: "Just now",
				rating: Number(form.rating),
				comment: form.comment,
				image: form.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(form.name || "Anonymous"),
			},
			...reviews,
		]);
		setForm({ name: "", rating: 5, comment: "", image: "" });
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
					<p
						className="text-muted-foreground text-balance"
						style={gradientTextStyle}
					>
						Don't just take our word for it. Here's what our clients have to say about their experiences with our stylists.
					</p>
				</div>

				{/* Review Submission Form */}
				<form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-10 bg-sky-300 hover:bg-sky-600 rounded-lg shadow p-6 space-y-4">
					<input
						type="text"
						name="name"
						placeholder="Your Name (optional)"
						value={form.name}
						onChange={handleChange}
						className="w-full border bg-green-700 hover:bg-green-600 rounded px-3 py-2"
					/>
					<select
						name="rating"
						value={form.rating}
						onChange={handleChange}
						className="w-full border bg-green-700 hover:bg-green-600 rounded px-3 py-2"
					>
						{[5,4,3,2,1].map(r => (
							<option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
						))}
					</select>
					<textarea
						name="comment"
						placeholder="Your feedback"
						value={form.comment}
						onChange={handleChange}
						required
						className="w-full border bg-green-700 hover:bg-green-600 rounded px-3 py-2"
					/>
					<input
						type="url"
						name="image"
						placeholder="Image URL (optional)"
						value={form.image}
						onChange={handleChange}
						className="w-full border bg-green-700 hover:bg-green-600 rounded px-3 py-2"
					/>
					<button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
						Submit Review
					</button>
				</form>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{reviews.map((review, index) => (
						<ReviewCard
							key={review.id}
							name={review.name}
							date={review.date}
							rating={review.rating}
							comment={review.comment}
							image={review.image}
							className="animate-fade-in"
							style={{ animationDelay: `${index * 0.1}s` }}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default Reviews;
