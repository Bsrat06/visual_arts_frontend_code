// src/components/admin/QuickAction.tsx
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Badge } from "../../components/ui/badge";
import React from "react";

// Define variant type to match Badge component
type BadgeVariant = "default" | "destructive" | "secondary" | "outline" | null | undefined;

// Update QuickActionProps to include custom styling flags for success/warning
interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  variant?: BadgeVariant; // Align with Badge component's variant
  customStyle?: "success" | "warning"; // Separate prop for custom styling
}

export function QuickAction({
  title,
  icon,
  href,
  badge,
  variant = "default",
  customStyle,
}: QuickActionProps) {
  // Classes for the Button component
  const variantClasses: Record<NonNullable<BadgeVariant> | "success" | "warning", string> = {
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
          className={`h-16 w-full flex-col gap-2 p-2 relative ${
            customStyle ? variantClasses[customStyle] : variantClasses[variant || "default"]
          }`}
        >
          <Link to={href}>
            <div className="p-2 rounded-full bg-background">
              {icon}
            </div>
            <span className="text-xs font-medium text-foreground line-clamp-1">{title}</span>
            {badge && (
              <Badge
                variant={badgeVariant}
                className={`absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center ${badgeCustomClass}`}
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