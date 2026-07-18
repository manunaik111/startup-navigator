import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    isLoading?: boolean;
    children: ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
    primary: "bg-gold text-navy hover:bg-gold-light",
    secondary: "bg-navy text-paper hover:bg-navy-light",
    ghost: "bg-transparent text-navy border border-navy/20 hover:bg-navy-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
    variant = "primary",
    isLoading = false,
    disabled,
    children,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {children}
        </button>
    );
}