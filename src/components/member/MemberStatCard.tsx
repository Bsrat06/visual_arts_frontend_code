import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import type { ReactNode } from "react"

type Props = {
  title: string
  value: number
  icon?: ReactNode
}

export function MemberStatCard({ title, value, icon }: Props) {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
