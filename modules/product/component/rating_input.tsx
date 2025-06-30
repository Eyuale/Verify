// components/product/component/rating_input.tsx (RatingInput)
"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  name: string;
  label?: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  required?: boolean;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  name,
  label,
  rating,
  onRatingChange,
  maxRating = 5,
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (newRating: number) => {
    onRatingChange(newRating);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          // <-- Fix is here: added [...Array(maxRating)]
          const ratingValue = index + 1;
          return (
            <Star
              key={ratingValue}
              className={`cursor-pointer transition-colors duration-200 ${
                ratingValue <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
              size={24}
              onMouseEnter={() => handleMouseEnter(ratingValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(ratingValue)}
            />
          );
        })}
      </div>
      <input type="hidden" name={name} value={rating} required={required} />

      {required && rating === 0 && (
        <p className="mt-1 text-xs text-red-500">Please select a rating.</p>
      )}
    </div>
  );
};

export default StarRatingInput;
