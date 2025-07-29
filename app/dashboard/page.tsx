"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, CreditCard, BarChart3, FileText, Activity, ArrowRight } from "lucide-react"
import Link from "next/link"
import LoadingWrapper from "@/components/loading-wrapper"
import ActivityLogItem from "@/components/activity-log-item"
import type { ActivityLog, ActivityLogSummary } from "@/types/activity-log"

function DashboardContent() {
  const [stats, setStats] = useState([
    { title: "Total Vouchers", value: "...", icon: FileText, color: "text-blue-600" },
    { title: "Cash Vouchers", value: "...", icon: Receipt, color: "text-green-600" },
    { title: "Cheque Vouchers", value: "...", icon: CreditCard, color: "text-purple-600" },
    { title: "This Month", value: "...", icon: BarChart3, color: "text-orange-600" },
  ])

  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVoucherCounts() {
      try {
        const response = await fetch("/api/vouchers/counts")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || "Unknown error"}`)
        }
        const data = await response.json()
        setStats([
          { title: "Total Vouchers", value: data.total_vouchers.toString(), icon: FileText, color: "text-blue-600" },
          { title: "Cash Vouchers", value: data.cash_vouchers.toString(), icon: Receipt, color: "text-green-600" },
          {
            title: "Cheque Vouchers",
            value: data.cheque_vouchers.toString(),
            icon: CreditCard,
            color: "text-purple-600",
          },
          {
            title: "This Month",
            value: data.vouchers_this_month.toString(),
            icon: BarChart3,
            color: "text-orange-600",
          },
        ])
      } catch (e: any) {
        console.error("Failed to fetch voucher counts:", e)
        setError(e.message)
        setStats((prevStats) => prevStats.map((stat) => ({ ...stat, value: "N/A" })))
      } finally {
        setLoading(false)
      }
    }

    async function fetchRecentActivities() {
      try {
        const response = await fetch("/api/activity-logs/summary")
        if (!response.ok) {
          throw new Error("Failed to fetch recent activities")
        }
        const data: ActivityLogSummary = await response.json()
        setRecentActivities(data.recent_activities || [])
      } catch (e: any) {
        console.error("Failed to fetch recent activities:", e)
      } finally {
        setActivitiesLoading(false)
      }
    }

    fetchVoucherCounts()
    fetchRecentActivities()
  }, [])

  const quickActions = [
    { title: "Create Cash Voucher", href: "/cash-voucher", icon: Receipt, color: "bg-green-500" },
    { title: "Create Cheque Voucher", href: "/cheque-voucher", icon: CreditCard, color: "bg-purple-500" },
    { title: "View Activity Logs", href: "/activity-logs", icon: Activity, color: "bg-blue-500" },
  ]

  if (error) {
    return <div className="container mx-auto p-4 max-w-6xl text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-row items-center gap-4 p-6">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-medium">{action.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <Link href="/activity-logs">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <ActivityLogItem key={activity.id} log={activity} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  return (
    <LoadingWrapper>
      <DashboardContent />
    </LoadingWrapper>
  )
}
