import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "default" | "secondary" | "destructive";
  disabled?: boolean;
  className?: string;
};

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "default",
  disabled = false,
  className = "",
}: Props) => {
  const base =
    "px-4 py-2 rounded-xl font-medium transition text-sm disabled:opacity-50";

  const variants = {
    default: "bg-green-600 text-white hover:bg-green-700",
    secondary: "bg-zinc-700 text-white hover:bg-zinc-600",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};