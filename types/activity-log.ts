export interface ActivityLog {
  id: number
  log_name: string | null
  description: string
  subject_id: number | null
  subject_type: string | null
  causer_id: number | null
  causer_type: string | null
  properties: Record<string, any> | null
  event: string | null
  batch_uuid: string | null
  created_at: string
  updated_at: string
  subject?: {
    id: number
    voucher_no: string
    [key: string]: any
  }
  causer?: {
    id: number
    name: string
    email: string
    [key: string]: any
  }
}

export interface ActivityLogResponse {
  data: ActivityLog[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ActivityLogSummary {
  total_logs: number
  today_logs: number
  this_week_logs: number
  top_users: Array<{
    causer_id: number
    causer_type: string
    activity_count: number
    causer?: {
      id: number
      name: string
      email: string
    }
  }>
  recent_activities: ActivityLog[]
}
