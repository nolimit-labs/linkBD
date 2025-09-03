import { Badge } from '@/components/ui/badge'

interface ProBadgeProps {
  className?: string
}

export function ProBadge({ className }: ProBadgeProps) {
  return (
    <Badge variant="secondary" className={className}>
      Pro   
    </Badge>
  )
} 