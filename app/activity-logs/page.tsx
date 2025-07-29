"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import ActivityLogItem from "@/components/activity-log-item"
import LoadingWrapper from "@/components/loading-wrapper"
import type { ActivityLog, ActivityLogResponse, ActivityLogSummary } from "@/types/activity-log"
import { Filter, RefreshCw, BarChart3, Users, Calendar, Activity } from "lucide-react"

function ActivityLogsContent() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [summary, setSummary] = useState<ActivityLogSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  // Filters
  const [filters, setFilters] = useState({
    log_name: "all",
    from_date: "",
    to_date: "",
    user_id: "",
    subject_type: "all",
    search: "",
  })

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "10",
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value)),
      })

      const response = await fetch(`/api/activity-logs?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch activity logs")
      }

      const data: ActivityLogResponse = await response.json()
      setLogs(data.data)
      setCurrentPage(data.current_page)
      setTotalPages(data.last_page)
      setTotalLogs(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const response = await fetch("/api/activity-logs/summary")
      if (!response.ok) {
        throw new Error("Failed to fetch summary")
      }

      const data: ActivityLogSummary = await response.json()
      setSummary(data)
    } catch (err: any) {
      console.error("Failed to fetch summary:", err)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchSummary()
  }, [])

  useEffect(() => {
    fetchLogs(1)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      log_name: "all",
      from_date: "",
      to_date: "",
      user_id: "",
      subject_type: "all",
      search: "",
    })
  }

  const handleRefresh = () => {
    fetchLogs(currentPage)
    fetchSummary()
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold">{summary.total_logs}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">{summary.today_logs}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{summary.this_week_logs}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{summary.top_users.length}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={filters.log_name} onValueChange={(value) => handleFilterChange("log_name", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Log Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
                <SelectItem value="default">Default</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.subject_type} onValueChange={(value) => handleFilterChange("subject_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Voucher Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vouchers</SelectItem>
                <SelectItem value="App\\Models\\CashVoucher">Cash Vouchers</SelectItem>
                <SelectItem value="App\\Models\\ChequeVoucher">Cheque Vouchers</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange("from_date", e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange("to_date", e.target.value)}
            />

            <Input
              placeholder="User ID"
              value={filters.user_id}
              onChange={(e) => handleFilterChange("user_id", e.target.value)}
            />

            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Badge variant="secondary">{totalLogs} total activities</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No activity logs found</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <ActivityLogItem key={log.id} log={log} showDetails />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ActivityLogsPage() {
  return (
    <LoadingWrapper>
      <ActivityLogsContent />
    </LoadingWrapper>
  )
}
