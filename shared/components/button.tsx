import React from "react";

type T_BUTTON = {
  className?: string;
  onClick?: () => void;
  label: string;
  icon?: React.ReactNode;
};

const Button = ({ className, onClick, label, icon }: T_BUTTON) => {
  return (
    <button
      className={`p-1 px-4 flex items-center justify-center h-8 cursor-pointer rounded-lg outline-none ${className} border`}
      onClick={onClick}
    >
      <span className="text-xs tracking-tight">
        {icon}
        {label}
      </span>
    </button>
  );
};

export default Button;
