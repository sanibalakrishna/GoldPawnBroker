import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  trend,
  className
}: StatsCardProps) => {
  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
              iconBgColor
            )}>
              <div className={cn("w-6 h-6", iconColor)}>
                {icon}
              </div>
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center space-x-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 