import React from "react";

type T_BUTTON = {
  className?: string;
  onClick?: () => void;
  label: string;
  icon?: React.ReactNode;
  type: "button" | "submit" | "reset";
};

const Button = ({ className, onClick, label, icon, type }: T_BUTTON) => {
  return (
    <button
      className={`p-1 px-4 flex items-center justify-center h-8 cursor-pointer rounded-lg outline-none ${className}`}
      onClick={onClick}
      type={type}
    >
      <span>{icon}</span>
      <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
};

export default Button;
