"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px] sm:flex-col",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-lg border shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:duration-[var(--radix-toast-swipe-duration)] data-[swipe=end]:ease-[var(--radix-toast-swipe-ease-out)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-gray-900 shadow-md",
        destructive: "border-red-200 bg-red-50 text-red-900 shadow-md",
        success: "border-green-200 bg-green-50 text-green-900 shadow-md",
        warning: "border-orange-200 bg-orange-50 text-orange-900 shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), "p-4 pr-8", className)} {...props} />
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "group-[.destructive]:border-red-300 group-[.destructive]:bg-red-100 group-[.destructive]:text-red-700 group-[.destructive]:hover:bg-red-200 group-[.destructive]:focus:ring-red-500",
      "group-[.success]:border-green-300 group-[.success]:bg-green-100 group-[.success]:text-green-700 group-[.success]:hover:bg-green-200 group-[.success]:focus:ring-green-500",
      "group-[.warning]:border-orange-300 group-[.warning]:bg-orange-100 group-[.warning]:text-orange-700 group-[.warning]:hover:bg-orange-200 group-[.warning]:focus:ring-orange-500",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-500",
      "group-[.success]:text-green-400 group-[.success]:hover:text-green-600 group-[.success]:hover:bg-green-100 group-[.success]:focus:ring-green-500",
      "group-[.warning]:text-orange-400 group-[.warning]:hover:text-orange-600 group-[.warning]:hover:bg-orange-100 group-[.warning]:focus:ring-orange-500",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = "ToastClose"

const ToastIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  const icons = {
    default: <Info className="h-5 w-5 text-blue-500" />,
    destructive: <XCircle className="h-5 w-5 text-red-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertCircle className="h-5 w-5 text-orange-500" />,
  }

  return (
    <div ref={ref} className={cn("flex-shrink-0 mt-0.5", className)} {...props}>
      {icons[variant || "default"]}
    </div>
  )
})
ToastIcon.displayName = "ToastIcon"

const ToastContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-1 min-w-0", className)} {...props} />,
)
ToastContent.displayName = "ToastContent"

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-5 text-gray-900", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm text-gray-600 leading-5 mt-1", className)} {...props} />
))
ToastDescription.displayName = "ToastDescription"

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants> & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactElement<typeof ToastAction>
  }

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastIcon,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastProps,
  type ToastActionElement,
}
