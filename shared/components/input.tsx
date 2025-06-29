// shared/components/input.tsx
"use client";

import React, { ChangeEvent } from "react";

type T_INPUT = {
  accept?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  isTextArea?: boolean;
  maxLength?: number;
  list?: string; // ← NEW
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  list, // ← NEW
  value,
  onChange,
}: T_INPUT) => {
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
          value={value}
          onChange={onChange}
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
          list={list} // ← PASS THROUGH
          value={value}
          onChange={onChange}
          className="bg-black/5 rounded-md dark:bg-white/5 p-2 text-sm"
        />
      )}

      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {String(value).length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};

export default Input;
