"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Upload, X, Save, ChevronUp, ChevronDown } from "lucide-react"
import domtoimage from "dom-to-image"
import { useToast } from "@/hooks/use-toast"

const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to format date consistently for preview to avoid hydration issues
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

export default function CashVoucher() {
  const { toast } = useToast()
  const currentYearTwoDigits = new Date().getFullYear().toString().slice(-2)
  const initialVoucherNo = `CSH-${currentYearTwoDigits}-000001`
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)

  const [formData, setFormData] = useState({
    paidTo: "",
    voucherNo: initialVoucherNo,
    date: "",
    logo: "/logo.png",
    projectDetails: "",
    ownerClient: "",
    purpose: "",
    note: "",
  })

  // Single particular instead of array
  const [particular, setParticular] = useState({
    description: "",
    amount: "",
  })

  const [receivedBy, setReceivedBy] = useState({
    name: "",
    signature: null as File | null,
    signatureUrl: "",
    date: "",
  })

  const [approvedBy, setApprovedBy] = useState({
    name: "",
    signature: null as File | null,
    signatureUrl: "",
    date: "",
  })

  const previewRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchLatestVoucherNo = async () => {
      try {
        const response = await fetch("/api/cash/latest-voucher-no", {
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched latest voucher number from API:", data.latest_voucher_no)
          setFormData((prev) => ({
            ...prev,
            voucherNo: data.latest_voucher_no,
          }))
        } else {
          console.error("Failed to fetch latest voucher number:", await response.json())
          toast({
            title: "Error",
            description: "Failed to load voucher number.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching latest voucher number:", error)
        toast({
          title: "Error",
          description: "Error connecting to backend for voucher number.",
          variant: "destructive",
        })
      }
    }
    fetchLatestVoucherNo()
  }, [])

  const updateParticular = (field: "description" | "amount", value: string) => {
    setParticular((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    return (Number.parseFloat(particular.amount) || 0).toFixed(2)
  }

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
      // Wait for images (e.g., logos, signatures) to load
      const images = Array.from(node.querySelectorAll("img"))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((res) => {
            img.onload = img.onerror = res
          })
        }),
      )

      // Generate PNG from node, using a fixed width for export
      const originalWidth = node.style.width
      const originalMaxWidth = node.style.maxWidth
      node.style.width = "1800px"
      node.style.maxWidth = "1800px"

      const dataUrl = await (domtoimage as any).toPng(node, {
        bgcolor: "#ffffff",
        width: 1800,
        height: node.offsetHeight,
        style: {
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        },
      })

      node.style.width = originalWidth
      node.style.maxWidth = originalMaxWidth

      // Download
      const link = document.createElement("a")
      link.download = `cash-voucher-${formData.voucherNo || "untitled"}.png`
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
    setIsSaving(true)
    try {
      const payload = new FormData()
      payload.append("paidTo", formData.paidTo)
      payload.append("voucherNo", formData.voucherNo)
      payload.append("date", formData.date)
      payload.append("projectDetails", formData.projectDetails)
      payload.append("ownerClient", formData.ownerClient)
      payload.append("purpose", formData.purpose)
      payload.append("note", formData.note)

      // Send single particular instead of array
      payload.append("particular[description]", particular.description)
      payload.append("particular[amount]", (Number.parseFloat(particular.amount) || 0).toString())

      payload.append("receivedBy[name]", receivedBy.name)
      if (receivedBy.signature) {
        payload.append("receivedBy[signature]", receivedBy.signature)
      }
      payload.append("receivedBy[date]", receivedBy.date)

      payload.append("approvedBy[name]", approvedBy.name)
      if (approvedBy.signature) {
        payload.append("approvedBy[signature]", approvedBy.signature)
      }
      payload.append("approvedBy[date]", approvedBy.date)

      const response = await fetch("/api/cash", {
        method: "POST",
        body: payload,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: "Voucher saved successfully!",
        })
        console.log("Voucher saved:", result)

        // Clean up any existing blob URLs before clearing
        if (receivedBy.signatureUrl && receivedBy.signatureUrl.startsWith("blob:")) {
          URL.revokeObjectURL(receivedBy.signatureUrl)
        }
        if (approvedBy.signatureUrl && approvedBy.signatureUrl.startsWith("blob:")) {
          URL.revokeObjectURL(approvedBy.signatureUrl)
        }

        // Reset ALL form fields completely for a new entry
        setFormData((prev) => ({
          ...prev,
          paidTo: "",
          date: "",
          projectDetails: "",
          ownerClient: "",
          purpose: "",
          note: "",
        }))

        // Reset particular to initial state
        setParticular({ description: "", amount: "" })

        // Reset receivedBy completely
        setReceivedBy({
          name: "",
          signature: null,
          signatureUrl: "",
          date: "",
        })

        // Reset approvedBy completely
        setApprovedBy({
          name: "",
          signature: null,
          signatureUrl: "",
          date: "",
        })

        // Fetch the next voucher number after successful save
        try {
          const nextVoucherResponse = await fetch("/api/cash/latest-voucher-no", {
            cache: "no-store",
          })
          if (nextVoucherResponse.ok) {
            const nextVoucherData = await nextVoucherResponse.json()
            setFormData((prev) => ({
              ...prev,
              voucherNo: nextVoucherData.latest_voucher_no,
            }))
          }
        } catch (error) {
          console.error("Error fetching next voucher number:", error)
        }
      } else {
        const contentType = response.headers.get("content-type")
        let errorData
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json()
        } else {
          errorData = await response.text()
          console.error("Received non-JSON response from Laravel (POST /cash-vouchers):", errorData)
        }
        toast({
          title: "Error",
          description: `Failed to save voucher: ${errorData.message || JSON.stringify(errorData.errors || errorData)}`,
          variant: "destructive",
        })
        console.error("Failed to save voucher:", errorData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: "destructive",
      })
      console.error("Submission error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cash Voucher</h1>
        <p className="text-slate-500">Create and manage cash vouchers with live preview.</p>
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
                <Input id="voucherNo" value={formData.voucherNo} readOnly />
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
                <Label htmlFor="projectDetails">Project Details</Label>
                <Input
                  id="projectDetails"
                  placeholder="Enter project details"
                  value={formData.projectDetails}
                  onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                />
              </div>
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

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Particular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Purpose <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter particular description"
                    value={particular.description}
                    onChange={(e) => updateParticular("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={particular.amount}
                    onChange={(e) => updateParticular("amount", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter additional notes"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
              />
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
              <Button onClick={handleSubmit} className="flex-1" size="lg" disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Voucher
                  </>
                )}
              </Button>
              <Button onClick={exportAsImage} className="flex-1" size="lg">
                <Download className="w-4 h-4 mr-2" /> Export as Image
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
              <h2 className="text-5xl font-bold underline mr-60">CASH VOUCHER</h2>
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
                  <span className="pb-1 text-xl mt-2">{formData.voucherNo}</span>
                </span>
              </div>
              <div className="flex items-center w-full justify-end">
                <div className="flex items-center">
                  <span className="font-semibold text-xl " style={{ width: "108px", textAlign: "left" }}>
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

          {/* Table - INCREASED FONT SIZES */}
          <div
            className="border-2 border-black mb-6"
            style={{
              height: "520px",
              display: "grid",
              gridTemplateRows: "auto 1fr",
            }}
          >
            {/* Header Row */}
            <div className="grid grid-cols-[8fr_4fr] border-b border-black bg-gray-100 h-[50px]">
              <div className="py-2 px-2 font-semibold text-center border-r border-black flex items-center justify-center text-xl">
                PARTICULARS
              </div>
              <div className="py-2 px-2 font-semibold text-center flex items-center justify-center text-xl">
                AMOUNT
              </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-[8fr_4fr]" style={{ overflow: "hidden" }}>
              {/* Left Column - Particulars */}
              <div className="border-r border-black p-4" style={{ overflow: "hidden" }}>
                {/* PURPOSE Section */}
                <div
                  style={{
                    height: "200px",
                    marginBottom: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-start">
                    <span className="font-bold text-xl mr-2">PURPOSE</span>
                    <span className="font-bold mr-2 text-xl">:</span>
                    <div
                      className="flex-1 whitespace-pre-wrap word-break-break-word text-xl"
                      style={{
                        overflow: "hidden",
                        maxHeight: "180px",
                      }}
                    >
                      {particular.description}
                    </div>
                  </div>
                </div>

                {/* NOTE Section */}
                <div
                  style={{
                    height: "150px",
                    marginBottom: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-start">
                    <span className="font-bold text-xl mr-2">NOTE</span>
                    <span className="font-bold mr-2 text-xl">:</span>
                    <div
                      className="flex-1 whitespace-pre-wrap word-break-break-word text-xl"
                      style={{
                        overflow: "hidden",
                        maxHeight: "130px",
                      }}
                    >
                      {formData.note}
                    </div>
                  </div>
                </div>

                {/* Spacer to push TOTAL to bottom */}
                <div style={{ flex: 1 }}></div>
              </div>

              {/* Right Column - Amount */}
              <div className="px-2 py-2 flex flex-col">
                {/* Spacer to align total at bottom */}
                <div style={{ flex: 1 }}></div>
                {/* Total at bottom */}
                <div className="flex items-center justify-between font-semibold pt-2 text-xl">
                  <span>TOTAL</span>
                  <span>₱ {Number(calculateTotal().split(".")[0]).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details Section - INCREASED FONT SIZES */}
          <div className="border-2 border-black mb-6 p-4">
            {/* PROJECT DETAILS */}
            <div className="flex items-center mb-2 whitespace-nowrap overflow-hidden">
              <span className="font-bold text-xl mr-2" style={{ width: "180px", flexShrink: 0 }}>
                PROJECT DETAILS
              </span>
              <span className="font-bold text-xl mr-2">:</span>
              <div className="border-b border-black text-xl truncate" style={{ width: "400px", whiteSpace: "nowrap" }}>
                {formData.projectDetails}
              </div>
            </div>

            {/* OWNER/CLIENT */}
            <div className="flex items-center mb-2">
              <span className="font-bold text-xl" style={{ width: "190px", flexShrink: 0 }}>
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
              <div className="font-semibold mb-4 text-xl">Received From</div>
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
                <div className="font-semibold mb-4 text-xl">Approved By</div>
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
