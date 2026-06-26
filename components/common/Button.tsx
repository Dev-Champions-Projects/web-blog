'use client'

import { cn } from "@/lib/utils";
import { IconType } from "react-icons/lib";

interface ButtonProps {
    label: string;
    disabled?: boolean;
    outlined?: boolean;
    small?: boolean;
    icon?: IconType
    className?: string;
    type?: "submit" | "reset" | "button" | undefined
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button = ({
    label, type, disabled, outlined, small, icon: Icon, className, onClick
}: ButtonProps) => {
    return (<button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn("disabled:opacity-70 disabled:cursor-not-allowed rounded-md hover:opacity-80 transition w-auto border-slate-300 border-2 flex items-center justify-center gap-2 py-3 px-5 my-2 bg-slate-700 text-white dark:border-slate-700",
            outlined && "bg-transparent text-slate-700 dark:text-slate-300 dark:bg-transparent",
            small && "text-sm py-1 px-2 border-[1px]",
            className && className
        )}
    >
        {Icon && <Icon size={20} />}
        {label}
    </button>);
}

export default Button;