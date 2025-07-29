"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import domtoimage from "dom-to-image"; // Changed from html2canvas
import { Download } from "lucide-react";

interface Particular {
  id: string;
  description: string;
  amount: number;
}

interface CashVoucher {
  id: string;
  paid_to: string;
  voucher_no: string;
  date: string;
  total_amount: number;
  particulars: Particular[];
  received_by_name: string;
  received_by_signature_url: string | null;
  received_by_date: string;
  approved_by_name: string;
  approved_by_signature_url: string | null;
  approved_by_date: string;
  status: string;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CashVoucherViewPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [voucher, setVoucher] = useState<CashVoucher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false); // New state for export loading
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const voucherRef = useRef<HTMLDivElement>(null); // Ref for the voucher content

  // Get the Laravel API URL from environment variables
  const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (id) {
      const fetchVoucher = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/cash-vouchers/${id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to fetch cash voucher"
            );
          }
          const data: CashVoucher = await response.json();
          setVoucher(data);
        } catch (err: any) {
          setError(err.message);
          toast({
            title: "Error",
            description: `Failed to load cash voucher: ${err.message}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchVoucher();
    }
  }, [id, toast]);

  // Helper function to get full signature URL with better error handling
  const getSignatureUrl = (relativePath: string | null) => {
    if (!relativePath) {
      return "/placeholder.svg?height=60&width=120&text=No+Signature";
    }
    // If the path already starts with http/https, return as is (e.g., if it's already a public CDN or base64)
    if (
      relativePath.startsWith("http://") ||
      relativePath.startsWith("https://")
    ) {
      // For external URLs, we now proxy them to avoid CORS issues with dom-to-image
      // Only proxy if the LARAVEL_API_URL is available, otherwise fall back to placeholder
      if (LARAVEL_API_URL) {
        // Encode the full external URL to pass it as a query parameter
        return `/api/proxy-image?url=${encodeURIComponent(relativePath)}`;
      } else {
        return "/placeholder.svg?height=60&width=120&text=No+API+URL";
      }
    }
    // If it's a relative path starting with /signatures/, construct the full Laravel URL
    // and then proxy it
    if (relativePath.startsWith("/signatures/")) {
      if (!LARAVEL_API_URL) {
        return "/placeholder.svg?height=60&width=120&text=No+API+URL";
      }
      let baseUrl = LARAVEL_API_URL.replace(/\/+$/, ""); // Remove trailing slashes
      if (baseUrl.endsWith("/api")) {
        baseUrl = baseUrl.slice(0, -4);
      }
      const fullLaravelUrl = `${baseUrl}${relativePath}`;
      return `/api/proxy-image?url=${encodeURIComponent(fullLaravelUrl)}`;
    }
    // Fallback for invalid paths
    return "/placeholder.svg?height=60&width=120&text=Invalid+Path";
  };

  // Handle image load errors
  const handleImageError = (imageKey: string) => {
    setImageErrors((prev) => ({ ...prev, [imageKey]: true }));
  };

  // Custom Image component with error handling
  const SignatureImage = ({
    src,
    alt,
    imageKey,
  }: {
    src: string | null;
    alt: string;
    imageKey: string;
  }) => {
    const imageUrl = getSignatureUrl(src);
    const hasError = imageErrors[imageKey];
    if (hasError || !src) {
      return (
        <div className="w-[240px] h-[120px] border border-gray-300 flex items-center justify-center text-xs text-gray-500 bg-gray-50">
          No Signature
        </div>
      );
    }
    return (
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        width={60}
        height={60}
     className="max-h-24 max-w-[240px] object-contain" // Increased max-h and max-w
        onError={() => handleImageError(imageKey)}
        crossOrigin="anonymous" // Ensure CORS is handled for dom-to-image
        style={{ objectFit: "contain" }} // Ensure image scales correctly
      />
    );
  };

  // Function to export the voucher as an image using dom-to-image
  const exportImage = async () => {
    if (!voucherRef.current) {
      toast({
        title: "Error",
        description: "Could not find the voucher content to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      toast({
        title: "Exporting...",
        description: "Generating image of the cash voucher.",
      });

      const node = voucherRef.current;
      // Wait for images (e.g., logos, signatures) to load
      const images = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = img.onerror = res;
          });
        })
      );

      // Temporarily adjust width for consistent export resolution
      const originalWidth = node.style.width;
      const originalMaxWidth = node.style.maxWidth;
      node.style.width = "1000px"; // Set your desired export width here
      node.style.maxWidth = "1000px"; // Ensure it doesn't exceed this width

      const dataUrl = await (domtoimage as any).toPng(node, {
        bgcolor: "#ffffff", // Force white background
        width: 1000, // Use the fixed width for export
        height: node.offsetHeight, // Capture the height after width adjustment
        style: {
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        },
      });

      // Restore original styles
      node.style.width = originalWidth;
      node.style.maxWidth = originalMaxWidth;

      // Download
      const link = document.createElement("a");
      link.download = `cash-voucher-${voucher?.voucher_no || "details"}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Cash voucher exported as image successfully!",
      });
    } catch (err: any) {
      console.error("Error exporting image:", err);
      toast({
        title: "Error",
        description: `Failed to export image: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <p>Loading cash voucher details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!voucher) {
    return <div className="p-4 text-gray-500">Cash Voucher not found.</div>;
  }

  const totalAmountInteger = Math.floor(
    Number.parseFloat(voucher.total_amount.toString())
  );
  const totalAmountDecimal = Number.parseFloat(voucher.total_amount.toString())
    .toFixed(2)
    .split(".")[1];

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
     <div className="mb-4 flex justify-end w-full">
  <Button
    onClick={exportImage}
       variant="outline"
    
    className="flex items-end gap-2 bg-transparent"
    disabled={isExporting}
  >
    <Download className="h-4 w-4" />
    {isExporting ? "Exporting..." : "Export as Image"}
  </Button>
</div>


      <div
        ref={voucherRef} // Attach the ref here
        className="bg-white p-6 border border-gray-300 text-black w-full max-w-4xl shadow-lg"
        style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}
      >
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-shrink-0 mr-4">
            <img
              src="/logo.png"
              alt="ABIC Realty Logo"
              width={150}
              height={56}
              className="max-h-14 max-w-[150px] object-contain"
              crossOrigin="anonymous" // Ensure CORS is handled for dom-to-image
            />
          </div>
          <div className="flex-grow text-center pt-2 mr-48">
            <h2 className="text-2xl font-bold underline uppercase">
              Cash Voucher
            </h2>
          </div>
        </div>

        {/* Paid To Section */}
        <div className="flex justify-between items-start mb-4">
          {/* Left: Paid To */}
          <div className="flex items-center mt-7">
            <span className="font-semibold mr-2">Paid to:</span>
            <span className="border-b border-black w-[150px] min-h-[1.5rem] pb-1 text-sm">
              {voucher.paid_to || "N/A"}
            </span>
          </div>
          {/* Right: Voucher No and Date */}
          <div className="text-right space-y-1 text-sm">
            <div className="flex items-center justify-end">
              <span className="font-semibold mr-2">Voucher No:</span>
              <span className="border-b border-black min-w-[120px] text-right px-1">
                {voucher.voucher_no || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <span className="font-semibold mr-2">Date:</span>
              <span className="border-b border-black min-w-[120px] text-right px-1">
                {formatDate(voucher.date) || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Particulars Table */}
        <div className="border border-black mb-4">
          {/* Table Header */}
          <div className="flex border-b border-black bg-gray-100 h-12">
            <div className="flex-1 border-r border-black flex items-center justify-center font-semibold uppercase text-sm">
              Particulars
            </div>
            <div className="w-[250px] flex items-center justify-center font-semibold uppercase text-sm">
              Amount
            </div>
          </div>
          {/* Table Body */}
          <div className="flex min-h-[245px]">
            {/* Particulars Column */}
            <div className="flex-1 border-r border-black p-2 text-sm">
              {voucher.particulars.length > 0 ? (
                voucher.particulars.map((p, index) => (
                  <div key={p.id || index} className="mb-1">
                    {p.description}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No particulars listed.</div>
              )}
            </div>
            {/* Amount Column */}
            <div className="w-[250px] flex">
              {/* Integer Part */}
              <div className="flex-1 border-r border-black p-2 text-right text-sm">
                {voucher.particulars.length > 0 ? (
                  voucher.particulars.map((p, index) => (
                    <div key={p.id || index} className="mb-1">
                      ₱ {Math.floor(Number.parseFloat(p.amount.toString()))}
                    </div>
                  ))
                ) : (
                  <>&nbsp;</>
                )}
              </div>
              {/* Decimal Part */}
              <div className="w-[60px] p-2 text-left text-sm">
                {voucher.particulars.length > 0 ? (
                  voucher.particulars.map((p, index) => (
                    <div key={p.id || index} className="mb-1">
                      .
                      {
                        Number.parseFloat(p.amount.toString())
                          .toFixed(2)
                          .split(".")[1]
                      }
                    </div>
                  ))
                ) : (
                  <>&nbsp;</>
                )}
              </div>
            </div>
          </div>
          {/* Table Footer - Total Row */}
          <div className="flex h-8">
            <div className="flex-1 border-r border-black flex items-center justify-end px-2 font-semibold text-sm">
              TOTAL
            </div>
            <div className="w-[250px] flex">
              <div className="flex-1 border-r border-black flex items-center justify-end px-2 font-semibold text-sm">
                ₱ {Number(totalAmountInteger).toLocaleString()}
              </div>
              <div className="w-[60px] flex items-center px-2 font-semibold text-sm">
                .{totalAmountDecimal}
              </div>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="flex justify-between mt-8 text-sm">
          <div className="flex-1 mr-8">
            <div className="mb-4 font-semibold">Received by:</div>
            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <div className="mb-[-20px] flex justify-center">
                  {" "}
                  {/* Adjusted margin-bottom */}
                  <SignatureImage
                    src={voucher.received_by_signature_url}
                    alt="Received By Signature"
                    imageKey="received_by"
                  />
                </div>
                <div className="border-b border-black min-h-[20px] text-center pb-1 mt-1.5">
                  {" "}
                  {/* Removed mb-1 here */}
                  {voucher.received_by_name || ""}
                </div>
                <div className="text-xs text-center uppercase">
                  PRINTED NAME AND SIGNATURE
                </div>
              </div>
              <div className="w-32">
                <div className="border-b border-black min-h-[20px] mb-1 text-center pb-1 mt-10">
                  {formatDate(voucher.received_by_date) || ""}
                </div>
                <div className="text-xs text-center uppercase">DATE</div>
              </div>
            </div>
          </div>
          <div className="flex-1 ml-8">
            <div className="mb-4 font-semibold">Approved by:</div>
            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <div className="mb-[-20px] flex justify-center">
                  {" "}
                  {/* Adjusted margin-bottom */}
                  <SignatureImage
                    src={voucher.approved_by_signature_url}
                    alt="Approved By Signature"
                    imageKey="approved_by"
                  />
                </div>
                <div className="border-b border-black min-h-[20px] text-center pb-1 mt-1.5">
                  {" "}
                  {/* Removed mb-1 here */}
                  {voucher.approved_by_name || ""}
                </div>
                <div className="text-xs text-center uppercase">
                  PRINTED NAME AND SIGNATURE
                </div>
              </div>
              <div className="w-32">
                <div className="border-b border-black min-h-[20px] mb-1 text-center pb-1 mt-10">
                  {formatDate(voucher.approved_by_date) || ""}
                </div>
                <div className="text-xs text-center uppercase">DATE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
