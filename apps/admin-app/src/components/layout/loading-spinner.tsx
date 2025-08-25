import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.ComponentProps<"div"> {
  spinnerSize?: string
  message?: string
  fullScreen?: boolean
}

function LoadingSpinner({ 
  className, 
  spinnerSize = "size-8", 
  message,
  fullScreen = false,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        fullScreen 
          ? "min-h-screen fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" 
          : "h-full min-h-[200px]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
            spinnerSize
          )}
          role="status"
          aria-label="Loading"
        />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}

export { LoadingSpinner } 