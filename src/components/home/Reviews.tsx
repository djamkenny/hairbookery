
import React from "react";
import ReviewCard from "@/components/ui/ReviewCard";

// Sample reviews data
const reviews = [
  {
    id: 1,
    name: "Larichica",
    date: "2 weeks ago",
    rating: 5,
    comment: "I really enjoy this site, it's easy to navigate, very professional and excessible for timely appointment and pay",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 2,
    name: "",
    date: "1 month ago",
    rating: 5,
    comment: "Malik is the best barber I've ever had. Perfect fade every time and his beard work is exceptional. Highly recommend!",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 3,
    name: "Tiana Brooks",
    date: "3 weeks ago",
    rating: 4,
    comment: "Zara did an excellent job with my color. She really understood what I wanted and delivered exactly that. My hair feels healthy and the color is beautiful.",
    image: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 4,
    name: "Deon Taylor",
    date: "2 months ago",
    rating: 5,
    comment: "Damon's expertise with locs is unmatched. He's been maintaining mine for over a year now and they've never looked better. Great conversation too!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  }
];

const Reviews = () => {
  return (
    <section id="reviews" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">What Our Clients Say</h2>
          <p className="text-muted-foreground text-balance">
            Don't just take our word for it. Here's what our clients have to say about their experiences with our stylists.
          </p>
        </div>
        
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
