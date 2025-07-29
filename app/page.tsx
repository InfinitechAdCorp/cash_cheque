"use client"

import { useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserContext } from "@/lib/UserContext"
import { magic } from "@/lib/magic" // Import the magic client
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, CreditCard, BarChart3, FileText, Plus, TrendingUp, LogOut } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [user, setUser] = useContext(UserContext) || [null, () => {}]
  const router = useRouter()

  // Redirect if user is not logged in or still loading
  useEffect(() => {
    if (!user && !user?.loading) {
      router.push("/login")
    }
  }, [user, router])

  const handleLogout = async () => {
    await magic.user.logout()
    setUser(null) // Clear user state
    router.push("/login")
  }

  // Show loading or redirect if user is not authenticated
  if (!user || user.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>
  }

  const stats = [
    { title: "Total Vouchers", value: "24", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Cash Vouchers", value: "15", icon: Receipt, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Cheque Vouchers", value: "9", icon: CreditCard, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "This Month", value: "12", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-100" },
  ]
  const quickActions = [
    {
      title: "Create Cash Voucher",
      href: "/cash-voucher",
      icon: Receipt,
      color: "bg-green-500 hover:bg-green-600",
      description: "Create a new cash voucher for payments",
    },
    {
      title: "Create Cheque Voucher",
      href: "/cheque-voucher",
      icon: CreditCard,
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Create a new cheque voucher for bank transactions",
    },
  ]
  const recentActivity = [
    { type: "Cash Voucher", number: "#CV-001", time: "2 hours ago", icon: Receipt, color: "text-green-600" },
    { type: "Cheque Voucher", number: "#CHQ-005", time: "5 hours ago", icon: CreditCard, color: "text-purple-600" },
    { type: "Cash Voucher", number: "#CV-002", time: "Yesterday", icon: Receipt, color: "text-green-600" },
    { type: "Cheque Voucher", number: "#CHQ-004", time: "2 days ago", icon: CreditCard, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome to ABIC Accounting System. Manage your vouchers efficiently.</p>
        <div className="flex justify-end">
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-slate-900">{action.title}</h3>
                    <p className="text-sm text-slate-500">{action.description}</p>
                    <Button asChild className="w-full">
                      <Link href={action.href}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <BarChart3 className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="p-2 rounded-full bg-white">
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {activity.type} {activity.number}
                  </p>
                  <p className="text-sm text-slate-500">Created {activity.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
