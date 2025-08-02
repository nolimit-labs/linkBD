import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useUploadFile, useGetFiles } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Image as ImageIcon, Building2, User } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { useActiveOrganization } from '@/lib/auth-client'

export const Route = createFileRoute('/(app)/images')({
  component: ImagesPage,
})

function ImagesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const uploadFile = useUploadFile()
  const { data: filesData, isLoading, error } = useGetFiles()
  const { data: activeOrg } = useActiveOrganization()

  const title = activeOrg ? 'Organization Images' : 'My Images'
  const description = activeOrg
    ? `Manage images for ${activeOrg.name}`
    : 'Upload and manage your personal images'


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    try {
      await uploadFile.mutateAsync(selectedFile)
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      // Error handling is done by the hook
    }
  }

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      // Open full-size image in new tab
      window.open(imageUrl, '_blank')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between px-6 py-4">
        <PageHeader
          title={title}
          description={description}
        />
        <Badge variant={activeOrg ? 'default' : 'secondary'} className="flex items-center gap-1.5">
          {activeOrg ? (
            <>
              <Building2 className="h-3 w-3" />
              {activeOrg.name}
            </>
          ) : (
            <>
              <User className="h-3 w-3" />
              Personal
            </>
          )}
        </Badge>
      </div>

      <div className="px-6 space-y-6">

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Image
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Uploading to {activeOrg ? `${activeOrg.name} organization` : 'personal workspace'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-input">Select Image</Label>
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supports: JPEG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadFile.isPending}
              className="w-full sm:w-auto"
            >
              {uploadFile.isPending ? 'Uploading...' : 'Upload Image'}
            </Button>
          </CardContent>
        </Card>

        {/* Images Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {activeOrg ? `${activeOrg.name} Images` : 'Your Images'}
          </h2>

          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading your images...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Failed to load images</p>
                <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
              </CardContent>
            </Card>
          ) : !filesData?.files || filesData.files.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No images uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload your first image above</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filesData.files.map((image) => image ? (
                <Card key={image.fileKey} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {/* Image Display */}
                      <div className="aspect-[4/3] relative bg-muted">
                        {image.downloadUrl ? (
                          <img
                            src={image.downloadUrl}
                            alt={image.filename}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(image.downloadUrl)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
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
              ) : null)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}