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
      className={`flex h-8 cursor-pointer items-center justify-center rounded-full p-4 py-5 outline-none ${className} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled} // Pass disabled prop to button
    >
      <span>{icon}</span>
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
};

export default Button;
