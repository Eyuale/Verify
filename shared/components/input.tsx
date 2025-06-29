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
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-sm">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
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
          className="min-h-[100px] resize-y rounded-md bg-black/5 p-2 text-sm dark:bg-white/5"
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
          className="rounded-md bg-black/5 p-2 text-sm dark:bg-white/5"
        />
      )}

      {maxLength && (
        <p className="text-right text-xs text-gray-500">
          {String(value).length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};

export default Input;
