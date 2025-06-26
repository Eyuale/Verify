import React from "react";

type T_INPUT = {
  label?: string;
  type: string;
  placeholder?: string;
  name: string;
  required?: boolean;
};

const Input = ({ label, type, placeholder, name, required }: T_INPUT) => {
  return (
    <div className="w-full space-y-2 flex flex-col">
      <label htmlFor="product_name" className="text-sm">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="bg-black/5 rounded-md dark:bg-white/5 p-2 text-sm"
      />
    </div>
  );
};

export default Input;
