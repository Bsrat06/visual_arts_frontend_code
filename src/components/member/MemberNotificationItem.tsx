type Props = {
  message: string
  date: string
}

export function MemberNotificationItem({ message, date }: Props) {
  return (
    <div className="p-3 border rounded-md text-sm">
      <p>{message}</p>
      <p className="text-xs text-muted-foreground mt-1">{new Date(date).toLocaleString()}</p>
    </div>
  )
}
