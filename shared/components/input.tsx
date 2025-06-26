"use client";

import React, { ChangeEvent } from "react";

// Update the type definition to accept `value` and `onChange` from the parent
type T_INPUT = {
  accept?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  isTextArea?: boolean;
  maxLength?: number;
  value?: string | number; // <-- ADDED: The component's value is now a required prop
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // <-- ADDED: The change handler is a prop
};

const Input = ({
  accept,
  label,
  type = "text",
  placeholder,
  name,
  required,
  isTextArea = false,
  maxLength,
  value, // <-- DESTRUCTURED from props
  onChange, // <-- DESTRUCTURED from props
}: T_INPUT) => {
  // REMOVED: The component no longer needs its own internal state for the value.
  // const [inputValue, setInputValue] = useState(initialValue);
  // const handleChange = ...

  return (
    <div className="w-full space-y-2 flex flex-col">
      <label htmlFor={name} className="text-sm">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          value={value} // <-- Use the `value` prop from the parent
          onChange={onChange} // <-- Use the `onChange` prop from the parent
          className="bg-black/5 rounded-md dark:bg-white/5 p-2 text-sm min-h-[100px] resize-y"
        />
      ) : (
        <input
          accept={accept}
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          value={value} // <-- Use the `value` prop from the parent
          onChange={onChange} // <-- Use the `onChange` prop from the parent
          className="bg-black/5 rounded-md dark:bg-white/5 p-2 text-sm"
        />
      )}

      {/* The character counter now reads the length of the value prop */}
      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {String(value).length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};

export default Input;
