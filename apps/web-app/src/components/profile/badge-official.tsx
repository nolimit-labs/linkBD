import { Badge } from '@/components/ui/badge'

interface OfficialBadgeProps {
  className?: string
}

export function OfficialBadge({ className }: OfficialBadgeProps) {
  return (
    <Badge variant="default" className={className}>
      Official
    </Badge>
  )
}