import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "default" | "secondary" | "destructive";
};

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "default",
}: Props) => {
  const base = "px-4 py-2 rounded font-medium transition-all text-sm border";

  const variants = {
    default: "bg-black text-white hover:bg-gray-800 border-transparent",
    secondary: "bg-white text-black border-gray-300 hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};
