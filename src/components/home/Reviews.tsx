import React, { useState, useEffect } from "react";
import ReviewCard from "@/components/ui/ReviewCard";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (make sure to use your own env vars or keys)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const gradientTextStyle: React.CSSProperties = {
	background: "linear-gradient(90deg, #4f8cff 0%, #38e8c3 100%)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
};

type Review = {
	id: number;
	name: string;
	rating: number;
	comment: string;
	image: string;
	created_at?: string;
};

const Reviews = () => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [form, setForm] = useState({
		name: "",
		rating: 5,
		comment: "",
		image: "",
	});
	const [loading, setLoading] = useState(false);

	// Fetch reviews from Supabase on mount
	useEffect(() => {
		const fetchReviews = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from("reviews")
				.select("*")
				.order("created_at", { ascending: false });
			if (!error && data) setReviews(data as Review[]);
			setLoading(false);
		};
		fetchReviews();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.comment) return;
		setLoading(true);
		const { data, error } = await supabase
			.from("reviews")
			.insert([
				{
					name: form.name || "Anonymous",
					rating: Number(form.rating),
					comment: form.comment,
					image:
						form.image ||
						"https://ui-avatars.com/api/?name=" +
							encodeURIComponent(form.name || "Anonymous"),
				},
			])
			.select("*");
		if (!error && data && data.length > 0) {
			setReviews([data[0], ...reviews]);
			setForm({ name: "", rating: 5, comment: "", image: "" });
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
					<p
						className="text-muted-foreground text-balance"
						style={gradientTextStyle}
					>
						Don't just take our word for it. Here's what our clients have to say
						about their experiences with our stylists.
					</p>
				</div>

				{/* Review Submission Form */}
				<form
					onSubmit={handleSubmit}
					className="max-w-xl mx-auto mb-10 bg-sky-300 hover:bg-sky-600 rounded-lg shadow p-6 space-y-4"
				>
					<input
						type="text"
						name="name"
						placeholder="Your Name (optional)"
						value={form.name}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2 bg-white"
					/>
					<select
						name="rating"
						value={form.rating}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2 bg-white"
					>
						{[5, 4, 3, 2, 1].map((r) => (
							<option key={r} value={r}>
								{r} Star{r > 1 ? "s" : ""}
							</option>
						))}
					</select>
					<textarea
						name="comment"
						placeholder="Your feedback"
						value={form.comment}
						onChange={handleChange}
						required
						className="w-full border rounded px-3 py-2 bg-white"
					/>
					<input
						type="url"
						name="image"
						placeholder="Image URL (optional)"
						value={form.image}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2 bg-white"
					/>
					<button
						type="submit"
						className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
						disabled={loading}
					>
						{loading ? "Submitting..." : "Submit Review"}
					</button>
				</form>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{loading && reviews.length === 0 ? (
						<div className="col-span-2 text-center text-lg">
							Loading reviews...
						</div>
					) : (
						reviews.map((review, index) => (
							<ReviewCard
								key={review.id}
								name={review.name}
								date={
									review.created_at
										? new Date(review.created_at).toLocaleDateString()
										: ""
								}
								rating={review.rating}
								comment={review.comment}
								image={review.image}
								className="animate-fade-in"
								style={{ animationDelay: `${index * 0.1}s` }}
							/>
						))
					)}
				</div>
			</div>
		</section>
	);
};

export default Reviews;
