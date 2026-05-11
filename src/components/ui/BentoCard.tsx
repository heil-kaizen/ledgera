import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "accent" | "image" | "light";
  to?: string;
  key?: React.Key;
}

export function BentoCard({ children, className, variant = "default", to, ...props }: BentoCardProps) {
  const baseStyles = "relative overflow-hidden rounded-4xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:scale-[1.01] duration-300";

  const variantStyles = {
    default: "bg-white border border-charity-darker/5",
    light: "bg-[#e5ebe6] border-none", // From the "Join Community" card
    dark: "bg-charity-dark text-white shadow-none",
    accent: "bg-charity-accent text-charity-darker",
    image: "bg-gray-900 text-white isolate", // Isolate for image z-index
  };

  const classNameValue = cn(baseStyles, variantStyles[variant], className);

  if (to) {
    return (
      <Link to={to} className={classNameValue} {...(props as any)}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classNameValue} {...props}>
      {children}
    </div>
  );
}

export function CardActionButton({ className, variant = "accent" }: { className?: string, variant?: "accent" | "dark" }) {
    const bg = variant === "accent" ? "bg-charity-accent text-charity-darker" : "bg-charity-dark text-white";
    return (
        <div className={cn("h-12 w-12 shrink-0 rounded-full flex items-center justify-center pointer-events-none", bg, className)}>
            <ArrowUpRight className="h-5 w-5" />
        </div>
    )
}
