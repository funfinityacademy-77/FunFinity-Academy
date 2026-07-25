import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

const colorPalette = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

/**
 * Dynamic Profile Avatar Component
 * Generates a colored avatar with the user's capitalized first initial
 * Color is deterministically based on the user's name/email
 */
export default function ProfileAvatar({
  name,
  email,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const { initial, bgColor } = useMemo(() => {
    // Get the first letter to display
    const displayName = name || email || "User";
    const initial = displayName.charAt(0).toUpperCase();
    
    // Generate a consistent color based on the name/email
    let hash = 0;
    const stringToHash = displayName.toLowerCase();
    for (let i = 0; i < stringToHash.length; i++) {
      hash = stringToHash.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorIndex = Math.abs(hash) % colorPalette.length;
    const bgColor = colorPalette[colorIndex];
    
    return { initial, bgColor };
  }, [name, email]);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-md",
        sizeClasses[size],
        bgColor,
        className
      )}
      aria-label={`Avatar for ${name || email || "User"}`}
      role="img"
    >
      {initial}
    </div>
  );
}
