import type { ActivityLog } from "@/types/activity-log"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, CreditCard, User, Calendar, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityLogItemProps {
  log: ActivityLog
  showDetails?: boolean
}

export default function ActivityLogItem({ log, showDetails = false }: ActivityLogItemProps) {
  const getIcon = () => {
    if (log.subject_type?.includes("CashVoucher")) {
      return <Receipt className="w-4 h-4 text-green-600" />
    } else if (log.subject_type?.includes("ChequeVoucher")) {
      return <CreditCard className="w-4 h-4 text-purple-600" />
    }
    return <FileText className="w-4 h-4 text-blue-600" />
  }

  const getEventColor = (event: string | null) => {
    switch (event) {
      case "created":
        return "bg-green-100 text-green-800"
      case "updated":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "status_changed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Unknown time"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">{log.description}</p>
              {log.event && (
                <Badge variant="secondary" className={getEventColor(log.event)}>
                  {log.event}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {log.causer && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="font-medium text-blue-600">
                    {log.causer.name || log.causer.email || "Unknown User"}
                  </span>
                  {log.causer.role && <span className="text-gray-400">({log.causer.role})</span>}
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimeAgo(log.created_at)}</span>
              </div>

              {log.subject && (
                <div className="flex items-center gap-1">
                  <span>#{log.subject.voucher_no}</span>
                </div>
              )}
            </div>

            {showDetails && log.properties && Object.keys(log.properties).length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <details>
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">View Details</summary>
                  <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(log.properties, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
