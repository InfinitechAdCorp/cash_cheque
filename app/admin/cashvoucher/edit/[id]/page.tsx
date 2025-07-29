"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import LoadingWrapper from "@/components/loading-wrapper"
import Image from "next/image"
import { PlusCircle, XCircle } from "lucide-react"

interface Particular {
  id?: string // Optional for new particulars
  description: string
  amount: number
}

interface CashVoucher {
  id: string
  paid_to: string
  voucher_no: string
  date: string
  total_amount: number
  particulars: Particular[]
  received_by_name: string
  received_by_signature_url: string | null
  received_by_date: string
  approved_by_name: string
  approved_by_signature_url: string | null
  approved_by_date: string
  status: string
}

// Get the Laravel API URL from environment variables
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL

// Helper function to get full signature URL
const getSignatureUrl = (relativePath: string | null) => {
  if (!relativePath || !LARAVEL_API_URL) {
    return "/placeholder.svg" // Fallback to placeholder if no path or API URL
  }
  // Ensure there's no double slash if LARAVEL_API_URL already ends with one
  const baseUrl = LARAVEL_API_URL.endsWith("/") ? LARAVEL_API_URL.slice(0, -1) : LARAVEL_API_URL
  return `${baseUrl}/${relativePath}`
}

export default function CashVoucherEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [voucher, setVoucher] = useState<CashVoucher | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    paid_to: "",
    voucher_no: "",
    date: "",
    particulars: [] as Particular[],
    received_by_name: "",
    received_by_signature: null as File | null,
    received_by_signature_cleared: false,
    received_by_date: "",
    approved_by_name: "",
    approved_by_signature: null as File | null,
    approved_by_signature_cleared: false,
    approved_by_date: "",
    status: "",
  })

  useEffect(() => {
    if (id) {
      const fetchVoucher = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/cash-vouchers/${id}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to fetch cash voucher")
          }
          const data: CashVoucher = await response.json()
          setVoucher(data)
          setFormData({
            paid_to: data.paid_to || "",
            voucher_no: data.voucher_no || "",
            date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
            particulars: data.particulars || [],
            received_by_name: data.received_by_name || "",
            received_by_signature: null,
            received_by_signature_cleared: false,
            received_by_date: data.received_by_date ? new Date(data.received_by_date).toISOString().split("T")[0] : "",
            approved_by_name: data.approved_by_name || "",
            approved_by_signature: null,
            approved_by_signature_cleared: false,
            approved_by_date: data.approved_by_date ? new Date(data.approved_by_date).toISOString().split("T")[0] : "",
            status: data.status || "",
          })
        } catch (err: any) {
          setError(err.message)
          toast({
            title: "Error",
            description: `Failed to load cash voucher: ${err.message}`,
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchVoucher()
    }
  }, [id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        [`${name}_cleared`]: false,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleParticularChange = (index: number, field: keyof Particular, value: string) => {
    const newParticulars = [...formData.particulars]
    if (field === "amount") {
      newParticulars[index][field] = Number.parseFloat(value) || 0
    } else {
      newParticulars[index][field] = value as any
    }
    setFormData((prev) => ({ ...prev, particulars: newParticulars }))
  }

  const addParticular = () => {
    setFormData((prev) => ({
      ...prev,
      particulars: [...prev.particulars, { description: "", amount: 0 }],
    }))
  }

  const removeParticular = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      particulars: prev.particulars.filter((_, i) => i !== index),
    }))
  }

  const handleClearSignature = (field: "received_by_signature" | "approved_by_signature") => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
      [`${field}_cleared`]: true,
    }))
    if (field === "received_by_signature") {
      setVoucher((prev) => (prev ? { ...prev, received_by_signature_url: null } : null))
    } else if (field === "approved_by_signature") {
      setVoucher((prev) => (prev ? { ...prev, approved_by_signature_url: null } : null))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setIsSaving(true)
    setError(null)

    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "particulars") {
        payload.append(key, JSON.stringify(value)) // Stringify particulars array
      } else if (key === "received_by_signature" || key === "approved_by_signature") {
        if (value instanceof File) {
          payload.append(key, value)
        }
      } else if (key === "received_by_signature_cleared" || key === "approved_by_signature_cleared") {
        if (value === true) {
          payload.append(key, "1")
        }
      } else {
        payload.append(key, String(value))
      }
    })
    payload.append("_method", "PUT") // Use PUT method for the API route

    try {
      const response = await fetch(`/api/cash-vouchers/${id}`, {
        method: "POST", // Use POST for FormData with _method PUT
        body: payload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || JSON.stringify(errorData.errors) || "Failed to update cash voucher")
      }

      toast({
        title: "Success",
        description: "Cash voucher updated successfully!",
      })
      router.push("/admin/cashvoucher")
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: `Failed to update cash voucher: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingWrapper>
        <p>Loading cash voucher for editing...</p>
      </LoadingWrapper>
    )
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  if (!voucher) {
    return <div className="p-4 text-gray-500">Cash Voucher not found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Cash Voucher</h1>
        <Button onClick={() => router.back()}>Back to List</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="voucher_no">Voucher No</Label>
            <Input id="voucher_no" name="voucher_no" value={formData.voucher_no} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="paid_to">Paid To</Label>
            <Input id="paid_to" name="paid_to" value={formData.paid_to} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-4">Particulars</h2>
        <div className="space-y-4">
          {formData.particulars.map((particular, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input
                  id={`description-${index}`}
                  value={particular.description}
                  onChange={(e) => handleParticularChange(index, "description", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`amount-${index}`}>Amount</Label>
                <Input
                  id={`amount-${index}`}
                  type="number"
                  step="0.01"
                  value={particular.amount}
                  onChange={(e) => handleParticularChange(index, "amount", e.target.value)}
                  required
                />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => removeParticular(index)}>
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Remove particular</span>
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addParticular}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Particular
          </Button>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-4">Received By</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="received_by_name">Name</Label>
            <Input
              id="received_by_name"
              name="received_by_name"
              value={formData.received_by_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="received_by_date">Date</Label>
            <Input
              id="received_by_date"
              name="received_by_date"
              type="date"
              value={formData.received_by_date}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="received_by_signature">Signature</Label>
            <Input id="received_by_signature" name="received_by_signature" type="file" onChange={handleChange} />
            {voucher?.received_by_signature_url && !formData.received_by_signature_cleared && (
              <div className="mt-2 flex items-center space-x-2">
                <Image
                  src={getSignatureUrl(voucher.received_by_signature_url) || "/placeholder.svg"}
                  alt="Current Received By Signature"
                  width={100}
                  height={50}
                  className="border"
                  crossOrigin="anonymous"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSignature("received_by_signature")}
                >
                  Clear Signature
                </Button>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-4">Approved By</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="approved_by_name">Name</Label>
            <Input
              id="approved_by_name"
              name="approved_by_name"
              value={formData.approved_by_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="approved_by_date">Date</Label>
            <Input
              id="approved_by_date"
              name="approved_by_date"
              type="date"
              value={formData.approved_by_date}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="approved_by_signature">Signature</Label>
            <Input id="approved_by_signature" name="approved_by_signature" type="file" onChange={handleChange} />
            {voucher?.approved_by_signature_url && !formData.approved_by_signature_cleared && (
              <div className="mt-2 flex items-center space-x-2">
                <Image
                  src={getSignatureUrl(voucher.approved_by_signature_url) || "/placeholder.svg"}
                  alt="Current Approved By Signature"
                  width={100}
                  height={50}
                  className="border"
                  crossOrigin="anonymous"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSignature("approved_by_signature")}
                >
                  Clear Signature
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
