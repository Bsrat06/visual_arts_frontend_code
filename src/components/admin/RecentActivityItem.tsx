import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { format } from "date-fns"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  Brush, 
  CalendarDays,
  FolderKanban,
  Mail,
  AlertCircle
} from "lucide-react"

// Define explicit types for the icon map keys
export type ActivityType = 
  | 'approval' 
  | 'rejection' 
  | 'pending' 
  | 'registration' 
  | 'artwork' 
  | 'event' 
  | 'project' 
  | 'announcement' 
  | 'warning' 
  | 'success'

// Define explicit types for status values
export type ActivityStatus = 
  | 'completed' 
  | 'pending' 
  | 'failed' 
  | 'info'

const iconMap: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  approval: Brush,
  rejection: XCircle,
  pending: Clock,
  registration: UserPlus,
  artwork: Brush,
  event: CalendarDays,
  project: FolderKanban,
  announcement: Mail,
  warning: AlertCircle,
  success: CheckCircle2
}

const statusColors: Record<ActivityStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800'
}

interface RecentActivityItemProps {
  type: ActivityType
  title: string
  user?: {
    name: string
    avatar?: string
  }
  timestamp: string | Date
  status?: ActivityStatus
  fullWidth?: boolean
}

export function RecentActivityItem({
  type,
  title,
  user,
  timestamp,
  status,
  fullWidth = false
}: RecentActivityItemProps) {
  const Icon = iconMap[type]
  
  return (
    <div className={`flex items-start ${fullWidth ? 'p-4 border rounded-lg' : 'pb-4'}`}>
      <div className="flex-shrink-0">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">
            {title}
          </p>
          <time className="text-xs text-muted-foreground">
            {format(new Date(timestamp), 'MMM d, h:mm a')}
          </time>
        </div>
        {user && (
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {user.name}
          </div>
        )}
        {status && (
          <Badge className={`mt-2 ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
      </div>
    </div>
  )
}