import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-navy/10 bg-white p-6 shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}