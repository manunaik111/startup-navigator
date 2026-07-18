import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    label?: string;
    fullPage?: boolean;
}

export function LoadingSpinner({ label = "Loading...", fullPage = false }: LoadingSpinnerProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 text-slate-light ${fullPage ? "min-h-[50vh]" : "py-12"
                }`}
        >
            <Loader2 size={28} className="animate-spin text-gold" />
            <p className="text-sm">{label}</p>
        </div>
    );
}