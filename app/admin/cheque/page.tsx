"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Ban,
  AlertTriangle,
  Plus,
  MoreVertical,
} from "lucide-react"
import LoadingWrapper from "@/components/loading-wrapper"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { OTPDialog } from "@/components/ui/otp-dialog"

interface ChequeVoucher {
  id: string
  paid_to: string
  voucher_no: string
  date: string
  amount: number | null // Allow amount to be null
  purpose: string
  check_no: string
  account_name: string
  account_number: string
  bank_amount: number | null // Allow bank_amount to be null
  received_by_name: string
  approved_by_name: string
  status: string
}

interface PaginatedResponse {
  data: ChequeVoucher[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

// Date formatting utility functions
const formatDate = (dateString: string, format: "short" | "long" | "medium" | "full" = "medium") => {
  const date = new Date(dateString)
  let options: Intl.DateTimeFormatOptions
  switch (format) {
    case "short":
      options = { month: "numeric", day: "numeric", year: "numeric" }
      break
    case "medium":
      options = { month: "short", day: "2-digit", year: "numeric" }
      break
    case "long":
      options = { month: "long", day: "2-digit", year: "numeric" }
      break
    case "full":
      options = {
        weekday: "long",
        month: "long",
        day: "2-digit",
        year: "numeric",
      }
      break
    default:
      options = { month: "short", day: "2-digit", year: "numeric" }
  }
  return new Intl.DateTimeFormat("en-US", options).format(date)
}

// Custom date formatter for "June 04, 1998" format
const formatDateLong = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })
}

export default function ChequeVoucherPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [vouchers, setVouchers] = useState<ChequeVoucher[]>([])
  const [pagination, setPagination] = useState<Omit<PaginatedResponse, "data"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<ChequeVoucher | null>(null)
  const adminEmail = "decastrojustin321@gmail.com"

  const fetchVouchers = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/cheque-vouchers?page=${page}&per_page=10`)
      if (!response.ok) {
        throw new Error("Failed to fetch cheque vouchers")
      }
      const data: PaginatedResponse = await response.json()
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format: Expected paginated response with data array")
      }
      setVouchers(data.data)
      setPagination({
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total,
        last_page: data.last_page,
        from: data.from,
        to: data.to,
      })
      setCurrentPage(data.current_page)
    } catch (error: any) {
      console.error("Error fetching cheque vouchers:", error)
      toast({
        title: "Error",
        description: `Failed to load vouchers: ${error.message || "An unexpected error occurred."}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers(currentPage)
  }, [])

  const handleView = (id: string) => {
    router.push(`/admin/cheque/view/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/cheque/edit/${id}`)
  }

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(`/api/cheque-vouchers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to cancel cheque voucher")
      }
      toast({
        title: "Success",
        description: "Cheque voucher has been cancelled successfully.",
        variant: "success",
      })
      fetchVouchers(currentPage)
    } catch (error: any) {
      console.error("Error cancelling cheque voucher:", error)
      toast({
        title: "Error",
        description: `Failed to cancel voucher: ${error.message || "An unexpected error occurred."}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = async (voucher: ChequeVoucher) => {
    setSelectedVoucher(voucher)
    try {
      const response = await fetch("/api/send-delete-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucher_id: voucher.id,
          voucher_type: "cheque",
          voucher_no: voucher.voucher_no,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send OTP")
      }
      const result = await response.json()
      setShowOTPDialog(true)
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${result.email}`,
        duration: 5000,
        variant: "success",
      })
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      })
    }
  }

  const handleOTPVerify = async (otp: string) => {
    if (!selectedVoucher) return
    try {
      const response = await fetch("/api/admin/cheque/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucher_id: selectedVoucher.id,
          otp,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete cheque voucher")
      }
      toast({
        title: "Success",
        description: `Cheque voucher ${selectedVoucher.voucher_no} has been deleted permanently.`,
        duration: 5000,
        variant: "success",
      })
      setShowOTPDialog(false)
      setSelectedVoucher(null)
      fetchVouchers(currentPage)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete voucher")
    }
  }

  const handleResendOTP = async () => {
    if (!selectedVoucher) return
    const response = await fetch("/api/send-delete-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voucher_id: selectedVoucher.id,
        voucher_type: "cheque",
        voucher_no: selectedVoucher.voucher_no,
      }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to resend OTP")
    }
    const result = await response.json()
    toast({
      title: "OTP Resent",
      description: `New verification code sent to ${result.email}`,
      duration: 5000,
      variant: "success",
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchVouchers(page)
  }

  // Mobile Card Component with improved date formatting and amount null check
  const MobileVoucherCard = ({ voucher }: { voucher: ChequeVoucher }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{voucher.voucher_no}</div>
          <div className="text-sm text-gray-600">{formatDateLong(voucher.date)}</div>
        </div>
        <Badge
          variant={
            voucher.status === "active" ? "default" : voucher.status === "cancelled" ? "destructive" : "secondary"
          }
          className="capitalize"
        >
          {voucher.status}
        </Badge>
      </div>
      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Paid To</div>
          <div className="text-sm font-medium text-gray-900">{voucher.paid_to}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Amount</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
              }).format(voucher.amount !== null ? Number.parseFloat(voucher.amount.toString()) : 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Check No</div>
            <div className="text-sm font-mono font-medium text-gray-900">{voucher.check_no}</div>
          </div>
        </div>
        {voucher.purpose && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Purpose</div>
            <div className="text-sm text-gray-700 truncate">{voucher.purpose}</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleView(voucher.id)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-3 bg-transparent">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCancel(voucher.id)}>
              <Ban className="h-4 w-4 mr-2 text-orange-600" />
              Cancel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(voucher)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const columns: ColumnDef<ChequeVoucher>[] = [
    {
      accessorKey: "voucher_no",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-semibold text-left justify-start"
          >
            Voucher No
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium whitespace-nowrap">{row.getValue("voucher_no")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-semibold text-left justify-start"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="whitespace-nowrap">{formatDateLong(row.getValue("date"))}</div>
      },
    },
    {
      accessorKey: "paid_to",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-semibold text-left justify-start"
          >
            Paid To
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="min-w-[120px] max-w-[200px]">
          <div className="truncate" title={row.getValue("paid_to")}>
            {row.getValue("paid_to")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-semibold text-right justify-end w-full"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number | null
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount !== null ? Number.parseFloat(amount.toString()) : 0)
        return <div className="text-right font-medium whitespace-nowrap">{formatted}</div>
      },
    },
    {
      accessorKey: "check_no",
      header: "Check No",
      cell: ({ row }) => <div className="font-mono text-sm whitespace-nowrap">{row.getValue("check_no")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={status === "active" ? "default" : status === "cancelled" ? "destructive" : "secondary"}
            className="capitalize whitespace-nowrap"
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const voucher = row.original
        return (
          <div className="flex justify-start space-x-1">
            <Button variant="outline" size="sm" onClick={() => handleView(voucher.id)} className="h-8 w-8 p-0">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="sr-only">View</span>
            </Button>
            {/* <Button variant="outline" size="sm" onClick={() => handleEdit(voucher.id)} className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4 text-green-600" />
              <span className="sr-only">Edit</span>
            </Button> */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                  <Ban className="h-4 w-4 text-orange-600" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <span>Cancel Voucher</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Are you sure you want to cancel voucher{" "}
                    <span className="font-semibold text-gray-900 break-all">{voucher.voucher_no}</span> (Check #{" "}
                    <span className="font-mono font-semibold text-gray-900">{voucher.check_no}</span>
                    )?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">No, Keep Active</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancel(voucher.id)}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                  >
                    Yes, Cancel Voucher
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(voucher)}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <LoadingWrapper>
        <p>Loading cheque vouchers...</p>
      </LoadingWrapper>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Cheque Vouchers</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track your cheque voucher transactions</p>
          </div>
        </div>
        {/* Content */}
        {vouchers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-center">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No cheque vouchers</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new cheque voucher.</p>
                <Button onClick={() => router.push("/cheque-voucher")} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cheque Voucher
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <DataTable
                columns={columns}
                data={vouchers}
                searchKey="paid_to"
                searchPlaceholder="Search by payee name..."
              />
            </div>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {/* Search Bar for Mobile */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <input
                  type="text"
                  placeholder="Search by payee name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Voucher Cards */}
              <div className="space-y-3">
                {vouchers.map((voucher) => (
                  <MobileVoucherCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            </div>
            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-6 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <div className="hidden sm:flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <div className="sm:hidden text-sm text-gray-600 px-2">
                      {currentPage} / {pagination.last_page}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.last_page}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* OTP Dialog */}
        <OTPDialog
          isOpen={showOTPDialog}
          onClose={() => {
            setShowOTPDialog(false)
            setSelectedVoucher(null)
          }}
          onVerify={handleOTPVerify}
          onResendOTP={handleResendOTP}
          voucherNo={selectedVoucher?.voucher_no || ""}
          voucherType="cheque"
          email={adminEmail}
        />
      </div>
    </div>
  )
}
