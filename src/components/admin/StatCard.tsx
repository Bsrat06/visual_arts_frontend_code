import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils"; // Import your cn utility
import { TrendingUp, TrendingDown } from "lucide-react"; // Import these for the change icon

type StatCardProps = {
  title: string;
  value: number | string;
  change?: number; // Optional change
  icon?: React.ReactNode;
  className?: string; // <-- ADD THIS LINE for className
};

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const showChange = change !== undefined && change !== 0; // Only show if change is provided and not zero

  return (
    // Apply the passed className directly to the Card component
    <Card className={cn("w-full shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {showChange && (
          <p className={cn(
            "text-xs mt-1", // Margin top for spacing
            isPositive ? 'text-green-500' : 'text-red-500'
          )}>
            {isPositive ? '+' : ''}{change}% {isPositive ? <TrendingUp className="inline w-3 h-3 ml-0.5" /> : <TrendingDown className="inline w-3 h-3 ml-0.5" />}
          </p>
        )}
      </CardContent>
    </Card>
  );
}