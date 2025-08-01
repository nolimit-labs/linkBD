import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ImageIcon, X, Building2, User } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useCreateTodo } from '@/api'
import { Label } from '@/components/ui/label'
import { useActiveOrganization } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'

export function NewTodoDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const createTodoWithImage = useCreateTodo()
  const { data: activeOrg } = useActiveOrganization()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById('image-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createTodoWithImage.mutateAsync({
        todoData: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
        imageFile: selectedImage || undefined,
      })
      
      setTitle('')
      setDescription('')
      setSelectedImage(null)
      setImagePreview(null)
      setOpen(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Todo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Creating todo in
            <Badge variant={activeOrg ? 'default' : 'secondary'} className="inline-flex items-center gap-1">
              {activeOrg ? (
                <>
                  <Building2 className="h-3 w-3" />
                  {activeOrg.name}
                </>
              ) : (
                <>
                  <User className="h-3 w-3" />
                  Personal workspace
                </>
              )}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="image-input" className="block text-sm font-medium mb-2">
              Image (optional)
            </Label>
            <div className="space-y-2">
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createTodoWithImage.isPending}>
              {createTodoWithImage.isPending ? 'Creating...' : 'Create Todo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}