"use client"; // This component needs client-side interactivity for character counting

import React, { useState, ChangeEvent } from "react";

type T_INPUT = {
  label?: string;
  type?: string; // Made optional as per previous discussion
  placeholder?: string;
  name: string;
  required?: boolean;
  isTextArea?: boolean; // New prop: to render a textarea
  maxLength?: number; // New prop: for character limit
  initialValue?: string; // New prop: to pre-fill value if needed
};

const Input = ({
  label,
  type = "text", // Default type to 'text' if not provided
  placeholder,
  name,
  required,
  isTextArea = false, // Default to false
  maxLength,
  initialValue = "", // Default to empty string
}: T_INPUT) => {
  // Use state to manage the value for character counting
  const [inputValue, setInputValue] = useState(initialValue);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="w-full space-y-2 flex flex-col">
      <label htmlFor={name} className="text-sm">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}{" "}
        {/* Add required indicator */}
      </label>
      {isTextArea ? (
        <textarea
          id={name} // Use id for label association
          name={name}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          value={inputValue} // Controlled component for counting
          onChange={handleChange}
          className="bg-black/5 rounded-md dark:bg-white/5 p-2 text-sm min-h-[100px] resize-y" // Added min-height and resize
        />
      ) : (
        <input
          id={name} // Use id for label association
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength} // Apply maxLength to input too if needed
          value={inputValue} // Controlled component for counting
          onChange={handleChange}
          className="bg-black/5 rounded-md dark:bg-white/5 p-2 text-sm"
        />
      )}

      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {inputValue.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};

export default Input;
