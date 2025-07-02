import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Badge } from "../../components/ui/badge";
import React from "react";
import { cn } from "../../lib/utils"; // Import your cn utility

// Define variant type to match Badge component
type BadgeVariant = "default" | "destructive" | "secondary" | "outline" | null | undefined;

// Update QuickActionProps to include custom styling flags for success/warning AND className
interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  variant?: BadgeVariant; // Align with Badge component's variant
  customStyle?: "success" | "warning"; // Separate prop for custom styling
  className?: string; // <-- ADD THIS LINE for className
}

export function QuickAction({
  title,
  icon,
  href,
  badge,
  variant = "default",
  customStyle,
  className, // <-- DESTRUCTURE className here
}: QuickActionProps) {
  // Classes for the Button component based on customStyle or variant
  const buttonVariantClasses: Record<NonNullable<BadgeVariant> | "success" | "warning", string> = {
    default: "bg-muted hover:bg-muted/80",
    destructive: "bg-red-100 hover:bg-red-100/80 text-red-800",
    secondary: "bg-muted hover:bg-muted/80",
    outline: "bg-muted hover:bg-muted/80",
    success: "bg-green-100 hover:bg-green-100/80 text-green-800",
    warning: "bg-yellow-100 hover:bg-yellow-100/80 text-yellow-800",
  };

  // Helper function to determine Badge variant and custom classes
  const getBadgeVariantAndClass = (
    actionVariant: BadgeVariant,
    customStyle?: "success" | "warning"
  ): { badgeVariant: BadgeVariant; className: string } => {
    if (customStyle === "success") {
      return { badgeVariant: "default", className: "bg-green-100 text-green-800" };
    }
    if (customStyle === "warning") {
      return { badgeVariant: "default", className: "bg-yellow-100 text-yellow-800" };
    }
    switch (actionVariant) {
      case "destructive":
        return { badgeVariant: "destructive", className: "" };
      case "outline":
        return { badgeVariant: "outline", className: "" };
      case "secondary":
        return { badgeVariant: "secondary", className: "" };
      case "default":
      default:
        return { badgeVariant: "secondary", className: "" }; // Use 'secondary' for default badge style
    }
  };

  const { badgeVariant, className: badgeCustomClass } = getBadgeVariantAndClass(variant, customStyle);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant="ghost"
          // Use cn to combine your default classes, the variant-specific classes, and the passed className
          className={cn(
            "h-16 w-full flex-col gap-2 p-2 relative",
            customStyle ? buttonVariantClasses[customStyle] : buttonVariantClasses[variant || "default"],
            className // <-- APPLY THE PASSED CLASSNAME HERE
          )}
        >
          <Link to={href} className="flex flex-col items-center justify-center w-full h-full"> {/* Ensure link covers area */}
            <div className="p-2 rounded-full bg-background">
              {icon}
            </div>
            <span className="text-xs font-medium text-foreground line-clamp-1 mt-1">{title}</span>
            {badge && (
              <Badge
                variant={badgeVariant}
                className={cn(
                  "absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs", // Added text-xs for smaller text
                  badgeCustomClass
                )}
              >
                {badge}
              </Badge>
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}