type Props = {
  message: string
  date: string
}

export function NotificationItem({ message, date }: Props) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <p className="text-sm">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">{new Date(date).toLocaleString()}</p>
    </div>
  )
}
