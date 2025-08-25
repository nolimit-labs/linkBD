import { Card, CardContent } from '@/components/ui/card'
import { Image as ImageIcon } from 'lucide-react'
import { ImageCard } from './image-card'

interface ImageFile {
  id: string
  fileKey: string
  filename: string
  size: number
  downloadUrl: string | null
}

interface ImagesGridProps {
  files: ImageFile[]
  isLoading: boolean
  error: any
  activeOrgName?: string
}

export function ImagesGrid({ files, isLoading, error, activeOrgName }: ImagesGridProps) {
  const handleImageClick = (imageUrl: string) => {
    // Open full-size image in new tab
    window.open(imageUrl, '_blank')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading your images...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Failed to load images</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </CardContent>
      </Card>
    )
  }

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No images uploaded yet</p>
          <p className="text-sm text-muted-foreground">Upload your first image above</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {activeOrgName ? `${activeOrgName} Images` : 'Your Images'}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {files.map((image) => image ? (
          <ImageCard 
            key={image.id}
            image={image} 
            onImageClick={handleImageClick}
          />
        ) : null)}
      </div>
    </div>
  )
}