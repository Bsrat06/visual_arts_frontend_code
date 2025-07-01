import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

type StatCardProps = {
  title: string
  value: number | string
  change?: number;
  icon?: React.ReactNode
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
