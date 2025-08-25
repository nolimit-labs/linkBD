import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Download,
  Loader2 
} from 'lucide-react'
import { useAdminProfileFiles } from '@/api/profile'
import { formatDistanceToNow } from 'date-fns'

interface ProfileFilesProps {
  profileId: string
  profileType: 'user' | 'organization'
}

export function ProfileFiles({ profileId, profileType }: ProfileFilesProps) {
  const { data, isLoading, error } = useAdminProfileFiles(profileId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Failed to load files
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { files, stats } = data

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
      return <Archive className="h-5 w-5" />
    }
    return <FileText className="h-5 w-5" />
  }

  // Get file type badge color
  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return { variant: 'secondary' as const, label: 'Image' }
    if (mimeType.startsWith('video/')) return { variant: 'outline' as const, label: 'Video' }
    if (mimeType.startsWith('audio/')) return { variant: 'outline' as const, label: 'Audio' }
    if (mimeType.includes('pdf')) return { variant: 'destructive' as const, label: 'PDF' }
    if (mimeType.includes('text')) return { variant: 'secondary' as const, label: 'Text' }
    return { variant: 'outline' as const, label: 'File' }
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalFiles}</div>
            <div className="text-xs text-muted-foreground">Total Files</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatFileSize(stats.totalSize)}</div>
            <div className="text-xs text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <div className="space-y-4">
        {files.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No files found
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => {
            const fileTypeBadge = getFileTypeBadge(file.mimeType)
            
            return (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5 flex-shrink-0">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate pr-2">
                          {file.filename}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={fileTypeBadge.variant}>
                            {fileTypeBadge.label}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(file.downloadUrl, '_blank')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>
                          Uploaded {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        File ID: {file.fileKey}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}