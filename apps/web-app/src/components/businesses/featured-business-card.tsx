import { Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'

type FeaturedBusinessCardProps = {
  business: {
    id: string
    name: string
    description?: string | null
    imageUrl?: string | null
    isOfficial?: boolean
    subscriptionPlan?: string | null
  }
}

export function FeaturedBusinessCard({ business }: FeaturedBusinessCardProps) {
  return (
    <Link
      to="/profile/$id"
      params={{ id: business.id }}
      className="block group"
    >
      <Card className="h-full hover:shadow-xl hover:shadow-primary/8 transition-all duration-500 border-2 hover:border-primary/25 hover:scale-[1.01] bg-gradient-to-br from-background to-primary/3">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-50 w-50 rounded-lg  ring-primary/15 group-hover:ring-primary/25 transition-all duration-300 flex-shrink-0">
              <AvatarImage src={business.imageUrl || undefined} className="object-cover rounded-lg" />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-lg">
                <Building2 className="h-24 w-24" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-3xl group-hover:text-primary transition-colors duration-300">
                  {business.name}
                </h3>
                {business.isOfficial && (
                  <Badge variant="default" className="text-sm">
                    Official
                  </Badge>
                )}
                {(business.subscriptionPlan === 'pro' || business.subscriptionPlan === 'pro_complementary') && (
                  <Badge variant="secondary" className="text-sm bg-secondary text-secondary-foreground">
                    Premium
                  </Badge>
                )}
              </div>
              {business.description && (
                <p className="text-base text-muted-foreground leading-relaxed line-clamp-3">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}