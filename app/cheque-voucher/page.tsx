"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Upload, X, Save, ChevronUp, ChevronDown } from "lucide-react"
import domtoimage from "dom-to-image"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatDateForPreview = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "" // Handle invalid date strings
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

export default function ChequeVoucher() {
  const { toast } = useToast()
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)

  const [formData, setFormData] = useState({
    paidTo: "",
    voucherNo: "",
    date: "",
    logo: "/logo.png",
    amount: "",
    purpose: "",
    note: "", // New field
    checkDate: "", // New field
    checkNo: "",
    accountName: "",
    accountNumber: "",
    projectDetails: "", // New field
    ownerClient: "", // New field
  })

  const [receivedBy, setReceivedBy] = useState<{
    name: string
    signature: File | null
    signatureUrl: string
    date: string
  }>({
    name: "",
    signature: null,
    signatureUrl: "",
    date: "",
  })

  const [approvedBy, setApprovedBy] = useState<{
    name: string
    signature: File | null
    signatureUrl: string
    date: string
  }>({
    name: "",
    signature: null,
    signatureUrl: "",
    date: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Fetch next voucher number on component mount
  useEffect(() => {
    const fetchNextVoucherNumber = async () => {
      try {
        const response = await fetch("/api/check/voucher-next-no")
        if (!response.ok) {
          throw new Error("Failed to fetch next voucher number")
        }
        const data = await response.json()
        setFormData((prev) => ({ ...prev, voucherNo: data.nextVoucherNo }))
      } catch (error) {
        console.error("Error fetching next voucher number:", error)
        toast({
          title: "Error",
          description: "Failed to load next voucher number. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchNextVoucherNumber()
  }, [])

  const handleSignatureUpload = (file: File, type: "received" | "approved") => {
    const url = URL.createObjectURL(file)
    if (type === "received") {
      setReceivedBy({ ...receivedBy, signature: file, signatureUrl: url })
    } else {
      setApprovedBy({ ...approvedBy, signature: file, signatureUrl: url })
    }
  }

  const removeSignature = (type: "received" | "approved") => {
    if (type === "received") {
      if (receivedBy.signatureUrl && receivedBy.signatureUrl.startsWith("blob:")) {
        URL.revokeObjectURL(receivedBy.signatureUrl)
      }
      setReceivedBy({ ...receivedBy, signature: null, signatureUrl: "" })
    } else {
      if (approvedBy.signatureUrl && approvedBy.signatureUrl.startsWith("blob:")) {
        URL.revokeObjectURL(approvedBy.signatureUrl)
      }
      setApprovedBy({ ...approvedBy, signature: null, signatureUrl: "" })
    }
  }

  const exportAsImage = async () => {
    if (!previewRef.current) return
    try {
      setIsSaving(true)
      const node = previewRef.current
      const images = Array.from(node.querySelectorAll("img"))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((res) => {
            img.onload = img.onerror = res
          })
        }),
      )

      const originalWidth = node.style.width
      const originalMaxWidth = node.style.maxWidth
      const originalTransform = node.style.transform
      // Set explicit dimensions and ensure font sizes are maintained
      node.style.width = "1800px"
      node.style.maxWidth = "1800px"
      node.style.transform = "scale(1)"

      const dataUrl = await (domtoimage as any).toPng(node, {
        bgcolor: "#ffffff",
        width: 1800,
        height: node.offsetHeight,
        style: {
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px", // Updated base font size
        },
        filter: (domNode: any) => {
          // Ensure all text elements maintain their font sizes
          if (domNode.style) {
            if (domNode.style.fontSize) {
              domNode.style.fontSize = domNode.style.fontSize
            }
          }
          return true
        },
      })

      // Restore original styles
      node.style.width = originalWidth
      node.style.maxWidth = originalMaxWidth
      node.style.transform = originalTransform

      const link = document.createElement("a")
      link.download = `cheque-voucher-${formData.voucherNo || "untitled"}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export voucher image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "logo") {
          payload.append(key, value)
        }
      })

      payload.append("receivedBy[name]", receivedBy.name)
      payload.append("receivedBy[date]", receivedBy.date)
      if (receivedBy.signature) {
        payload.append("receivedBy[signature]", receivedBy.signature)
      }

      payload.append("approvedBy[name]", approvedBy.name)
      payload.append("approvedBy[date]", approvedBy.date)
      if (approvedBy.signature) {
        payload.append("approvedBy[signature]", approvedBy.signature)
      }

      const response = await fetch("/api/check", {
        method: "POST",
        body: payload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: "Voucher saved successfully!",
      })

      // Clean up blob URLs
      if (receivedBy.signatureUrl && receivedBy.signatureUrl.startsWith("blob:")) {
        URL.revokeObjectURL(receivedBy.signatureUrl)
      }
      if (approvedBy.signatureUrl && approvedBy.signatureUrl.startsWith("blob:")) {
        URL.revokeObjectURL(approvedBy.signatureUrl)
      }

      // Reset form
      setFormData((prev) => ({
        ...prev,
        paidTo: "",
        date: "",
        amount: "",
        purpose: "",
        note: "",
        checkDate: "",
        checkNo: "",
        accountName: "",
        accountNumber: "",
        projectDetails: "",
        ownerClient: "",
      }))

      setReceivedBy({
        name: "",
        signature: null,
        signatureUrl: "",
        date: "",
      })

      setApprovedBy({
        name: "",
        signature: null,
        signatureUrl: "",
        date: "",
      })

      // Fetch next voucher number
      const nextVoucherResponse = await fetch("/api/check/voucher-next-no")
      if (nextVoucherResponse.ok) {
        const nextVoucherData = await nextVoucherResponse.json()
        setFormData((prev) => ({
          ...prev,
          voucherNo: nextVoucherData.nextVoucherNo,
        }))
      }
    } catch (error: any) {
      console.error("Error saving voucher:", error)
      let errorMessage = "Failed to save voucher. Please try again."
      try {
        const parsedError = JSON.parse(error.message)
        if (parsedError.errors) {
          const validationErrors = Object.entries(parsedError.errors)
            .map(([field, messages]) => {
              const fieldName = field
                .replace(/([A-Z])/g, " $1")
                .toLowerCase()
                .replace("by.", "by ")
              return `${fieldName}: ${(messages as string[]).join(", ")}`
            })
            .join("\n")
          errorMessage = `Validation failed:\n${validationErrors}`
        } else if (parsedError.message) {
          errorMessage = parsedError.message
        }
      } catch (parseError) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">Cheque Voucher</h1>
        <p className="text-slate-500">Create and manage cheque vouchers with live preview.</p>
      </div>

      {/* Collapsible Form Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900">Voucher Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="flex items-center gap-2"
            >
              {isFormCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Form
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Form
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {!isFormCollapsed && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paidTo">Paid To</Label>
                <Input
                  id="paidTo"
                  placeholder="Enter payee name"
                  value={formData.paidTo}
                  onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucherNo">Voucher No</Label>
                <Input
                  id="voucherNo"
                  placeholder="Enter voucher number"
                  value={formData.voucherNo}
                  onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Particulars</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Enter purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    placeholder="Enter note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkDate">Check Date</Label>
                <Input
                  id="checkDate"
                  type="date"
                  value={formData.checkDate}
                  onChange={(e) => setFormData({ ...formData, checkDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkNo">Check No</Label>
                <Input
                  id="checkNo"
                  placeholder="Enter check number"
                  value={formData.checkNo}
                  onChange={(e) => setFormData({ ...formData, checkNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Enter account name"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectDetails">Project Details</Label>
                  <Textarea
                    id="projectDetails"
                    placeholder="Enter project details"
                    value={formData.projectDetails}
                    onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerClient">Owner/Client</Label>
                  <Input
                    id="ownerClient"
                    placeholder="Enter owner/client name"
                    value={formData.ownerClient}
                    onChange={(e) => setFormData({ ...formData, ownerClient: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Received From</h4>
                <div className="space-y-2">
                  <Label>Printed Name</Label>
                  <Input
                    placeholder="Enter printed name"
                    value={receivedBy.name}
                    onChange={(e) => setReceivedBy({ ...receivedBy, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Signature</Label>
                  {receivedBy.signatureUrl ? (
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2">
                        <img
                          src={receivedBy.signatureUrl || "/placeholder.svg"}
                          alt="Signature"
                          className="max-h-20 mx-auto"
                          crossOrigin="anonymous"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeSignature("received")}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <Label htmlFor="receivedSignature" className="cursor-pointer text-sm text-gray-600">
                        Click to upload signature
                      </Label>
                      <Input
                        id="receivedSignature"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleSignatureUpload(file, "received")
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={receivedBy.date}
                    onChange={(e) => setReceivedBy({ ...receivedBy, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Approved By</h4>
                <div className="space-y-2">
                  <Label>Printed Name</Label>
                  <Input
                    placeholder="Enter printed name"
                    value={approvedBy.name}
                    onChange={(e) => setApprovedBy({ ...approvedBy, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Signature</Label>
                  {approvedBy.signatureUrl ? (
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2">
                        <img
                          src={approvedBy.signatureUrl || "/placeholder.svg"}
                          alt="Signature"
                          className="max-h-20 mx-auto"
                          crossOrigin="anonymous"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeSignature("approved")}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <Label htmlFor="approvedSignature" className="cursor-pointer text-sm text-gray-600">
                        Click to upload signature
                      </Label>
                      <Input
                        id="approvedSignature"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleSignatureUpload(file, "approved")
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={approvedBy.date}
                    onChange={(e) => setApprovedBy({ ...approvedBy, date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSubmit} className="flex-1" size="lg" disabled={isLoading}>
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Voucher
                  </>
                )}
              </Button>
              <Button onClick={exportAsImage} className="flex-1" size="lg" disabled={isSaving}>
                <Download className="w-4 h-4 mr-2" />
                {isSaving ? "Exporting..." : "Export as Image"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Full Width Preview Section */}
      <Card className="w-full border rounded-lg bg-white shadow-sm">
        <div
          ref={previewRef}
          className="bg-white p-6 border-2 border-gray-300 text-black w-full text-lg"
          style={{
            fontFamily: "Arial, sans-serif",
            minWidth: "800px",
            fontSize: "14px", // Increased base font size
          }}
        >
          {/* Header with Logo and Title */}
           <div className="flex items-start justify-between mb-6">
            <div className="flex-shrink-0">
              <img
                src={formData.logo || "/placeholder.svg"}
                alt="Company Logo"
                className="max-h-[180px] max-w-[320px]"
                crossOrigin="anonymous"
              />
            </div>
            <div className="text-center flex-grow">
              <h2 className="text-5xl font-bold underline mr-60">CHEQUE VOUCHER</h2>
            </div>
          </div>

          {/* Header Info - INCREASED FONT SIZES */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mb-4">
            <div className="flex items-center mt-8">
              <span className="font-semibold text-xl">Paid to:</span>
              <span className="ml-2 border-b border-black flex-grow min-h-[1.5rem] flex items-end max-w-[400px]">
                <span className="pb-1 text-xl">{formData.paidTo}</span>
              </span>
            </div>
            <div className="flex flex-col items-end space-y-1 mt-4 sm:mt-0">
              <div className="flex items-center w-full justify-end">
                <div className="flex items-center">
                  <span className="font-semibold text-xl">Voucher No</span>
                  <span className="font-semibold ml-1 text-xl">:</span>
                </div>
                <span className="border-b border-black inline-flex items-end min-w-[185px] text-right min-h-[1.5rem] ml-2">
                  <span className="pb-1 text-xl">{formData.voucherNo}</span>
                </span>
              </div>
              <div className="flex items-center w-full justify-end">
                <div className="flex items-center">
                  <span className="font-semibold text-xl" style={{ width: "108px", textAlign: "left" }}>
                    Date
                  </span>
                  <span className="font-semibold ml-1 text-xl">:</span>
                </div>
                <span className="border-b border-black inline-flex items-end min-w-[185px] text-right min-h-[1.5rem] ml-2">
                  <span className="pb-1 text-xl">{formatDateForPreview(formData.date)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Main Table - INCREASED FONT SIZES */}
          <div
            className="border-2 border-black mb-6"
            style={{
              height: "520px",
              display: "grid",
              gridTemplateRows: "auto 1fr",
            }}
          >
            {/* Table Header - Fixed Height */}
            <div className="grid grid-cols-[70%_30%] border-b-2 border-black bg-gray-100">
              <div className="border-r-2 border-black p-3 text-center font-bold text-base">PARTICULARS</div>
              <div className="p-3 text-center font-bold text-base">AMOUNT</div>
            </div>

            {/* Table Content - Takes remaining space with overflow hidden */}
            <div className="grid grid-cols-[70%_30%]" style={{ overflow: "hidden" }}>
              {/* Left Column - Particulars with fixed content areas */}
              <div className="border-r-2 border-black p-4" style={{ overflow: "hidden" }}>
                {/* PURPOSE Section - Increased height to show more content */}
                {/* PURPOSE Section */}
                <div
                  style={{
                    height: "150px",
                    marginBottom: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-start mb-2">
                    <span className="font-bold text-base mt-1" style={{ width: "100px", flexShrink: 0 }}>
                      PURPOSE
                    </span>
                    <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <div
                      className="pb-1 text-xl"
                      style={{
                        flex: 1,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflow: "hidden",
                        maxHeight: "140px",
                      }}
                    >
                      {formData.purpose}
                    </div>
                  </div>
                </div>

                {/* NOTE Section */}
                <div
                  style={{
                    height: "60px",
                    marginBottom: "24px",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-start mb-2">
                    <span className="font-bold text-base mt-1" style={{ width: "100px", flexShrink: 0 }}>
                      NOTE
                    </span>
                      <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <div
                      className="pb-1 text-xl"
                      style={{
                        flex: 1,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflow: "hidden",
                        maxHeight: "60px",
                      }}
                    >
                      {formData.note}
                    </div>
                  </div>
                </div>

                {/* Other fields - Fixed spacing with aligned colons */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-bold text-base" style={{ width: "200px", flexShrink: 0 }}>
                      CHECK DATE
                    </span>
                      <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <span
                      className="border-b border-black pb-1 text-xl"
                      style={{ overflow: "hidden", width: "400px" }}
                    >
                      {formatDate(formData.checkDate)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-base" style={{ width: "200px", flexShrink: 0 }}>
                      CHECK NO.
                    </span>
                       <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <span
                      className="border-b border-black pb-1 text-xl"
                      style={{ overflow: "hidden", width: "400px" }}
                    >
                      {formData.checkNo}
                    </span>
                  </div>
                  <div className="flex items-center whitespace-nowrap">
                    <span className="font-semibold text-base" style={{ width: "200px", flexShrink: 0 }}>
                      ACCOUNT NAME
                    </span>
                        <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <span
                      className="border-b border-black pb-1 text-xl"
                      style={{
                        overflow: "hidden",
                        width: "400px",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formData.accountName}
                    </span>
                  </div>
                  <div className="flex items-center whitespace-nowrap">
                    <span className="font-semibold text-base" style={{ width: "200px", flexShrink: 0 }}>
                      ACCOUNT NUMBER
                    </span>
                       <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <span
                      className="border-b border-black pb-1 text-xl"
                      style={{
                        overflow: "hidden",
                        width: "400px",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formData.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-base" style={{ width: "200px", flexShrink: 0 }}>
                      AMOUNT
                    </span>
                        <span className="font-semibold mr-2 text-xl" style={{ flexShrink: 0 }}>
                      :
                    </span>
                    <span
                      className="border-b border-black pb-1 text-xl"
                      style={{ overflow: "hidden", width: "400px" }}
                    >
                      {formData.amount
                        ? `₱${Number(formData.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Amount */}
              <div className="p-4 flex items-end justify-end">
                <div className="text-lg font-bold">
                  {formData.amount
                    ? `₱${Number(formData.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details Section - INCREASED FONT SIZES */}
          <div className="border-2 border-black mb-6 p-4">
            {/* PROJECT DETAILS */}
            <div className="flex items-start mb-2">
              <span className="font-bold text-base whitespace-nowrap" style={{ width: "200px", flexShrink: 0 }}>
                PROJECT DETAILS
              </span>
              <span className="font-bold mr-2 text-xl" style={{ flexShrink: 0 }}>
                :
              </span>
              <div className="border-b border-black text-xl" style={{ width: "400px" }}>
                {formData.projectDetails}
              </div>
            </div>

            {/* OWNER/CLIENT */}
            <div className="flex items-center mb-2">
              <span className="font-bold text-sm" style={{ width: "200px", flexShrink: 0 }}>
                OWNER/CLIENT
              </span>
              <span className="font-semibold mr-2 text-xl">:</span>
              <div className="border-b border-black text-xl" style={{ width: "400px" }}>
                {formData.ownerClient}
              </div>
            </div>
          </div>

          {/* Signatures - INCREASED FONT SIZES */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-4 text-base">Received From</div>
              <div className="flex gap-4">
                <div style={{ width: "320px" }}>
                  <div className="border-b-2 border-black min-h-[60px] flex items-end justify-center relative mb-2">
                    {receivedBy.signatureUrl && (
                      <img
                        src={receivedBy.signatureUrl || "/placeholder.svg"}
                        alt="Signature"
                        className="max-h-20 max-w-[160px] object-contain absolute bottom-2"
                        crossOrigin="anonymous"
                      />
                    )}
                    <span className="pb-1 text-xl">{receivedBy.name}</span>
                  </div>
                  <div className="text-base text-center font-medium">PRINTED NAME AND SIGNATURE</div>
                </div>
                <div style={{ width: "180px" }}>
                  <div className="border-b-2 border-black min-h-[60px] flex items-end justify-center mb-2">
                    <span className="pb-1 text-xl">{formatDate(receivedBy.date)}</span>
                  </div>
                  <div className="text-base text-center font-medium">DATE</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div>
                <div className="font-semibold mb-4 text-base">Approved By</div>
                <div className="flex gap-4">
                  <div style={{ width: "320px" }}>
                    <div className="border-b-2 border-black min-h-[60px] flex items-end justify-center relative mb-2">
                      {approvedBy.signatureUrl && (
                        <img
                          src={approvedBy.signatureUrl || "/placeholder.svg"}
                          alt="Signature"
                          className="max-h-20 max-w-[160px] object-contain absolute bottom-2"
                          crossOrigin="anonymous"
                        />
                      )}
                      <span className="pb-1 text-xl">{approvedBy.name}</span>
                    </div>
                    <div className="text-base text-center font-medium">PRINTED NAME AND SIGNATURE</div>
                  </div>
                  <div style={{ width: "180px" }}>
                    <div className="border-b-2 border-black min-h-[60px] flex items-end justify-center mb-2">
                      <span className="pb-1 text-xl">{formatDate(approvedBy.date)}</span>
                    </div>
                    <div className="text-base text-center font-medium">DATE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
