// shared/components/button.tsx (Button)
import React from "react";

type T_BUTTON = {
  className?: string;
  onClick?: () => void;
  label: string;
  icon?: React.ReactNode;
  type: "button" | "submit" | "reset";
  disabled?: boolean; // Added disabled prop
};

const Button = ({
  className,
  onClick,
  label,
  icon,
  type,
  disabled,
}: T_BUTTON) => {
  return (
    <button
      className={`p-4 py-5 flex items-center justify-center h-8 cursor-pointer rounded-full outline-none ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled} // Pass disabled prop to button
    >
      <span>{icon}</span>
      <span className="text-[13px] tracking-tight font-medium">{label}</span>
    </button>
  );
};

export default Button;
