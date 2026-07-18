import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorMessage({
    message = "Something went wrong. Please try again.",
    onRetry,
}: ErrorMessageProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <AlertTriangle size={24} className="text-red-500" />
            <p className="text-sm text-red-700">{message}</p>
            {onRetry && (
                <Button variant="ghost" onClick={onRetry} className="mt-1">
                    Try again
                </Button>
            )}
        </div>
    );
}