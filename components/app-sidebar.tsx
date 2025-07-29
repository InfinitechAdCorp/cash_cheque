"use client"

import {
  Home,
  Receipt,
  CreditCard,
  Settings,
  HelpCircle,
  Calculator,
  Banknote,
  Scale,
  BookText,
  ClipboardList,
  TrendingUp,
  Wallet,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

// Grouping menu items into logical categories
const mainVoucherItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Cash Voucher",
    url: "/cash-voucher",
    icon: Receipt,
  },
  {
    title: "Cheque Voucher",
    url: "/cheque-voucher",
    icon: CreditCard,
  },
]

const adminVoucherItems = [
  {
    title: "Admin Cash Vouchers",
    url: "/admin/cashvoucher",
    icon: Receipt, // Using Receipt for cash admin
  },
  {
    title: "Admin Cheque Vouchers",
    url: "/admin/cheque",
    icon: CreditCard, // Using CreditCard for cheque admin
  },
]

const accountingModuleItems = [
  {
    title: "Bank",
    url: "/admin/bank",
    icon: Banknote,
  },
  {
    title: "Chart of Accounts",
    url: "/admin/chartofaccounts",
    icon: Scale,
  },
  {
    title: "Journal Entry",
    url: "/admin/journalentry",
    icon: BookText,
  },
  {
    title: "Trial Balance",
    url: "/admin/trialbalance",
    icon: ClipboardList,
  },
  {
    title: "Income Statement",
    url: "/admin/incomestatement",
    icon: TrendingUp,
  },
  {
    title: "Balance Sheet",
    url: "/admin/balancesheet",
    icon: Wallet,
  },
]

const systemItems = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/admin/help",
    icon: HelpCircle,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Call logout API
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
          variant: "success",
        })

        // Clear any local storage or session data if needed
        localStorage.clear()
        sessionStorage.clear()

        // Force a full page redirect to login
        window.location.href = "/login"
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
      setIsLoggingOut(false) // Only reset loading state on error
    }
    // Don't reset setIsLoggingOut(false) on success since we're redirecting
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Calculator className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ABIC Accounting</span>
            <span className="text-xs text-slate-500">Voucher System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Voucher Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Voucher Creation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainVoucherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Admin Voucher Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminVoucherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Accounting Modules Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Accounting Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountingModuleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* System Section */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2 text-xs text-slate-500 text-center">© 2024 ABIC Accounting</div>
      </SidebarFooter>
    </Sidebar>
  )
}
