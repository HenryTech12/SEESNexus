import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    isLoading,
    className = "",
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary:
            "bg-sees-mustard text-sees-void shadow-glow-mustard hover:brightness-110",
        secondary:
            "border-2 border-sees-mint text-sees-mint hover:bg-sees-mint/10 text-glow-mint",
        ghost: "text-sees-mint hover:bg-sees-mint/10",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
