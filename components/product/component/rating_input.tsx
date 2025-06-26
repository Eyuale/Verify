"use client"; // This component needs client-side interactivity

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  name: string;
  label: string;
  initialRating?: number; // For pre-filling if needed (e.g., editing)
  maxRating?: number;
  required?: boolean;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  name,
  label,
  initialRating = 0,
  maxRating = 5,
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    setSelectedRating(index);
  };

  const displayRating = hoverRating || selectedRating;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
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
              onClick={() => handleClick(ratingValue)}
            />
          );
        })}
      </div>
      {/* Hidden input to submit the selected rating as part of the form data */}
      <input
        type="hidden"
        name={name}
        value={selectedRating}
        required={required}
      />
      {required && selectedRating === 0 && (
        <p className="text-red-500 text-xs mt-1">Please select a rating.</p>
      )}
    </div>
  );
};

export default StarRatingInput;
