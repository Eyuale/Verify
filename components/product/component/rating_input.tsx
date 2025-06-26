"use client"; // This component needs client-side interactivity

import React, { useState } from "react";
import { Star } from "lucide-react";

// Update the props interface to make the component controlled
interface StarRatingInputProps {
  name: string;
  label: string;
  rating: number; // <-- ADDED: The current rating is now passed as a prop
  onRatingChange: (rating: number) => void; // <-- ADDED: A function to call when the rating changes
  maxRating?: number;
  required?: boolean;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  name,
  label,
  rating, // <-- DESTRUCTURED: The current rating value from props
  onRatingChange, // <-- DESTRUCTURED: The handler function from props
  maxRating = 5,
  required = false,
}) => {
  // The hover state can remain internal as it's purely for UI display
  const [hoverRating, setHoverRating] = useState(0);

  // REMOVED: The selected rating is no longer managed internally.
  // The `rating` prop is the single source of truth.
  // const [selectedRating, setSelectedRating] = useState(initialRating);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (newRating: number) => {
    // Instead of setting internal state, call the function passed from the parent.
    onRatingChange(newRating);
  };

  // The display logic now uses the `rating` prop for the selected value.
  const displayRating = hoverRating || rating;

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <Star
              key={ratingValue}
              className={`cursor-pointer transition-colors duration-200 ${
                ratingValue <= displayRating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              size={24}
              onMouseEnter={() => handleMouseEnter(ratingValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(ratingValue)} // <-- Calls the new handler
            />
          );
        })}
      </div>
      {/* The hidden input now reflects the rating from the parent's state */}
      <input type="hidden" name={name} value={rating} required={required} />

      {/* The validation message also uses the `rating` prop */}
      {required && rating === 0 && (
        <p className="text-red-500 text-xs mt-1">Please select a rating.</p>
      )}
    </div>
  );
};

export default StarRatingInput;
