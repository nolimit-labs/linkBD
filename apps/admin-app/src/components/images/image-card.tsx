import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image as ImageIcon, Trash2 } from 'lucide-react'
import { useDeleteFile } from '@/api'

interface ImageFile {
  id: string
  fileKey: string
  filename: string
  size: number
  downloadUrl: string | null
}

interface ImageCardProps {
  image: ImageFile
  onImageClick?: (imageUrl: string) => void
}

export function ImageCard({ image, onImageClick }: ImageCardProps) {
  const deleteFile = useDeleteFile()

  const handleImageClick = () => {
    if (image.downloadUrl && onImageClick) {
      onImageClick(image.downloadUrl)
    }
  }

  const handleDeleteImage = async () => {
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      try {
        await deleteFile.mutateAsync(image.id)
      } catch (error) {
        // Error handling is done by the hook
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* Image Display */}
          <div className="aspect-[4/3] relative bg-muted group">
            {image.downloadUrl ? (
              <img
                src={image.downloadUrl}
                alt={image.filename}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Delete Button - shows on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteImage()
                }}
                disabled={deleteFile.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Info */}
          <div className="p-2">
            <div className="space-y-0.5">
              <p className="font-medium truncate text-xs">{image.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(image.size)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}