"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import LoadingWrapper from "@/components/loading-wrapper"
import Image from "next/image"
import { Download } from "lucide-react"
import domtoimage from "dom-to-image"

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
  received_by_signature_url: string | null
  received_by_date: string
  approved_by_name: string
  approved_by_signature_url: string | null
  approved_by_date: string
  status: string
}

const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function ChequeVoucherViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [voucher, setVoucher] = useState<ChequeVoucher | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})
  const voucherRef = useRef<HTMLDivElement>(null)

  // Get the Laravel API URL from environment variables (if needed for proxying)
  const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (id) {
      const fetchVoucher = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/cheque-vouchers/${id}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to fetch cheque voucher")
          }
          const data: ChequeVoucher = await response.json()
          setVoucher(data)
        } catch (err: any) {
          setError(err.message)
          toast({
            title: "Error",
            description: `Failed to load cheque voucher: ${err.message}`,
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchVoucher()
    }
  }, [id, toast])

  // Helper function to get full signature URL with better error handling
  const getSignatureUrl = (relativePath: string | null) => {
    if (!relativePath) {
      return "/placeholder.svg?height=120&width=240&text=No+Signature" // Increased size
    }
    // If the path already starts with http/https, return as is (e.g., if it's already a public CDN or base64)
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      // For external URLs, we now proxy them to avoid CORS issues with dom-to-image
      // Only proxy if the LARAVEL_API_URL is available, otherwise fall back to placeholder
      if (LARAVEL_API_URL) {
        // Encode the full external URL to pass it as a query parameter
        return `/api/proxy-image?url=${encodeURIComponent(relativePath)}`
      } else {
        return "/placeholder.svg?height=120&width=240&text=No+API+URL" // Increased size
      }
    }
    // If it's a relative path starting with /signatures/, construct the full Laravel URL
    // and then proxy it
    if (relativePath.startsWith("/signatures/")) {
      if (!LARAVEL_API_URL) {
        return "/placeholder.svg?height=120&width=240&text=No+API+URL" // Increased size
      }
      let baseUrl = LARAVEL_API_URL.replace(/\/+$/, "") // Remove trailing slashes
      if (baseUrl.endsWith("/api")) {
        baseUrl = baseUrl.slice(0, -4)
      }
      const fullLaravelUrl = `${baseUrl}${relativePath}`
      return `/api/proxy-image?url=${encodeURIComponent(fullLaravelUrl)}`
    }
    // Fallback for invalid paths
    return "/placeholder.svg?height=120&width=240&text=Invalid+Path" // Increased size
  }

  // Custom Image component with error handling, mirroring CashVoucherViewPage
  const SignatureImage = ({
    src,
    alt,
    imageKey,
  }: {
    src: string | null
    alt: string
    imageKey: string
  }) => {
    const imageUrl = getSignatureUrl(src)
    const hasError = imageErrors[imageKey]
    if (hasError || !src) {
      return (
        <div className="w-[240px] h-[120px] border border-gray-300 flex items-center justify-center text-xs text-gray-500 bg-gray-50">
          {" "}
          {/* Increased size */}
          No Signature
        </div>
      )
    }
    return (
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        width={80} // Increased size
        height={80} // Increased size
        className="max-h-24 max-w-[240px] object-contain" // Increased max-h and max-w
        onError={() => handleImageError(imageKey)}
        crossOrigin="anonymous" // Ensure CORS is handled for dom-to-image
        style={{ objectFit: "contain" }} // Ensure image scales correctly
      />
    )
  }

  const exportAsImage = async () => {
    if (!voucherRef.current || !voucher) return

    try {
      setIsExporting(true)
      const node = voucherRef.current

      // Store original styles and classes
      const originalClassName = node.className
      const originalMaxWidth = node.style.maxWidth
      const originalWidth = node.style.width
      const originalMargin = node.style.margin

      // Temporarily adjust styles for export
      // Remove centering and max-width, set a generous fixed width
      node.className = "border border-gray-300 p-6 rounded-lg shadow-sm bg-white w-full" // Remove max-w-4xl mx-auto
      node.style.maxWidth = "none" // Ensure no max-width constraint
      node.style.width = "1200px" // A wider width to capture all content
      node.style.margin = "0" // Remove auto margins for left alignment

      // Wait for images to load
      const images = Array.from(node.querySelectorAll("img"))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((res) => {
            img.onload = img.onerror = res
          })
        }),
      )

      // Increased delay to let layout settle after style changes
      await new Promise((resolve) => setTimeout(resolve, 700))

      // Capture with the fixed dimensions
      const dataUrl = await (domtoimage as any).toPng(node, {
        bgcolor: "#ffffff",
        style: {
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        },
        quality: 1.0,
        width: 1200, // Use the wider fixed width for export
        height: node.offsetHeight, // Capture accurate height
      })

      // Restore original styles immediately
      node.className = originalClassName
      node.style.maxWidth = originalMaxWidth
      node.style.width = originalWidth
      node.style.margin = originalMargin

      // Download
      const link = document.createElement("a")
      link.download = `cheque-voucher-${voucher.voucher_no}.png`
      link.href = dataUrl
      link.click()
      toast({
        title: "Success",
        description: `Voucher ${voucher.voucher_no} exported successfully!`,
        variant: "success",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export voucher image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImageError = (imageKey: string) => {
    setImageErrors((prev) => ({ ...prev, [imageKey]: true }))
  }

  if (isLoading) {
    return (
      <LoadingWrapper>
        <p>Loading cheque voucher details...</p>
      </LoadingWrapper>
    )
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  if (!voucher) {
    return <div className="p-4 text-gray-500">Cheque Voucher not found.</div>
  }

  // Helper function to safely format amount
  const formatAmount = (amount: number | null) => {
    if (amount === null || isNaN(Number(amount))) {
      return { integer: "0", decimal: "00" }
    }
    const parsedAmount = Number.parseFloat(amount.toString())
    const integerPart = Math.floor(parsedAmount).toLocaleString()
    const decimalPart = parsedAmount.toFixed(2).split(".")[1]
    return { integer: integerPart, decimal: decimalPart }
  }

  const formattedAmount = formatAmount(voucher.amount)

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
  <div className="ml-auto">
    <Button
      onClick={exportAsImage}
      disabled={isExporting}
      variant="outline"
      className="bg-transparent"
    >
      <Download className="w-4 h-4 mr-2" />
      {isExporting ? "Exporting..." : "Export as Image"}
    </Button>
  </div>
</div>

      <div
        ref={voucherRef}
        className="border border-gray-300 p-6 rounded-lg shadow-sm bg-white w-full max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-shrink-0 mr-4">
            <Image
              src="/logo.png"
              alt="ABIC Realty Logo"
              width={150}
              height={56}
              className="max-h-14 max-w-[150px] object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex-grow text-center">
            <h1 className="text-2xl font-bold underline mt-6 mr-48">CHEQUE VOUCHER</h1>
          </div>
        </div>
        <div className="mb-6 flex justify-between items-start">
          {/* Left side: Paid to */}
          <div className="flex items-center flex-1">
            <span className="font-semibold mr-2 mt-6">Paid to:</span>
            <span className="border-b border-black flex-1 text-lg mt-6 pb-1 max-w-md">{voucher.paid_to}</span>
          </div>
          {/* Right side: Voucher No and Date */}
          <div className="text-right text-sm ml-4 flex-shrink-0">
            <div className="mb-2">
              <span className="font-semibold">Voucher No: </span>
              <span className="border-b border-black px-2 pb-1">{voucher.voucher_no}</span>
            </div>
            <div>
              <span className="font-semibold mr-2">Date: </span>
              <span className="border-b border-black px-9 pb-2">
                {new Date(voucher.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        {/* Particulars and Amount Table */}
        <div className="border border-black mb-6 w-full">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_290px] border-b border-black">
            <div className="border-r border-black p-3 text-center font-bold bg-gray-100">PARTICULARS</div>
            <div className="p-3 text-center font-bold bg-gray-100">AMOUNT</div>
          </div>
          {/* Content Row */}
          <div className="grid grid-cols-[1fr_290px] min-h-[160px]">
            {/* Particulars Column */}
            <div className="border-r border-black p-3 align-top text-sm">
              <div className="flex flex-wrap items-start mb-16">
                <span className="font-semibold mr-2">Purpose:</span>
                <pre className="whitespace-pre-wrap break-words flex-1 min-h-[1.2rem]">{voucher.purpose}</pre>
              </div>
              <div className="flex items-center flex-wrap mb-2">
                <span className="font-semibold">Check No:</span>
                <span className="ml-1 inline-flex items-end flex-grow min-h-[1.2rem]">
                  <span className="pb-px">{voucher.check_no}</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="font-semibold">Bank Details:</span>
                <div className="pl-4 space-y-2 mt-2">
                  <div className="flex items-center flex-wrap">
                    <span className="font-semibold">Account Name:</span>
                    <span className="ml-1 border-b border-black inline-flex items-end w-[250px] min-h-[1.2rem]">
                      <span className="pb-px">{voucher.account_name}</span>
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap">
                    <span className="font-semibold">Account Number:</span>
                    <span className="ml-1 border-b border-black inline-flex items-end w-[235px] min-h-[1.2rem]">
                      <span className="pb-px">{voucher.account_number}</span>
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap">
                    <span className="font-semibold">Amount:</span>
                    <span className="ml-1 border-b border-black inline-flex items-end w-[295px] min-h-[1.2rem]">
                      <span className="pb-px">
                        {voucher.amount ? (
                          `₱${Number(voucher.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        ) : (
                          <>&nbsp;</>
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Amount Column - This column remains empty in the content row as per original code */}
            <div className="grid grid-cols-[1fr_60px]">
              <div className="border-r border-black p-3 text-right"></div>
              <div className="p-3 text-left"></div>
            </div>
          </div>
          {/* Total Row */}
          <div className="grid grid-cols-[1fr_290px]">
            <div className="border-r border-black p-3 text-right font-bold">TOTAL</div>
            <div className="grid grid-cols-[1fr_60px]">
              {/* Integer Part */}
              <div className="border-r border-black p-3 text-right font-bold">₱{formattedAmount.integer}</div>
              {/* Decimal Part */}
              <div className="p-3 text-left font-bold">.{formattedAmount.decimal}</div>
            </div>
          </div>
        </div>
        {/* Signatures Section */}
        <div className="grid grid-cols-2 gap-8 mt-8 text-sm">
          <div>
            <div className="mb-4 font-semibold">Received by:</div>
            <div className="grid grid-cols-[1fr_100px] gap-4 mb-2">
              <div className="flex flex-col items-center">
                <div className="mb-[-20px] flex justify-center">
                  <SignatureImage
                    src={voucher.received_by_signature_url}
                    alt="Received By Signature"
                    imageKey="received"
                  />
                </div>
                <div className="border-b border-black text-center w-full pb-1 mt-1">{voucher.received_by_name || ""}</div>
                <div className="text-xs text-center uppercase mt-1">PRINTED NAME AND SIGNATURE</div>
              </div>
              <div>
                <div className="border-b border-black min-h-[20px] mb-1 text-center pb-1 mt-14">
                  {formatDate(voucher.received_by_date) || ""}
                </div>
                <div className="text-xs text-center uppercase">DATE</div>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-4 font-semibold">Approved by:</div>
            <div className="grid grid-cols-[1fr_100px] gap-4 mb-8">
              <div className="flex flex-col items-center">
                <div className="mb-[-20px] flex justify-center">
                  <SignatureImage
                    src={voucher.approved_by_signature_url}
                    alt="Approved By Signature"
                    imageKey="approved"
                  />
                </div>
                <div className="border-b border-black text-center w-full pb-1 mt-1">{voucher.approved_by_name || ""}</div>
                <div className="text-xs text-center uppercase mt-1">PRINTED NAME AND SIGNATURE</div>
              </div>
              <div>
                <div className="border-b border-black min-h-[20px] mb-1 text-center pb-1 mt-14">
                  {formatDate(voucher.approved_by_date) || ""}
                </div>
                <div className="text-xs text-center uppercase">DATE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
