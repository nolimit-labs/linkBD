import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit3 } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useUpdateUser } from '@/api/user'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// Form validation schema
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
})

type UpdateUserFormData = z.infer<typeof updateUserSchema>

interface UpdateUserDialogProps {
  user: {
    id: string
    name?: string | null
    email: string
    role?: string | null
    emailVerified?: boolean
  }
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpdateUserDialog({ user, open: controlledOpen, onOpenChange }: UpdateUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const updateUser = useUpdateUser()
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Initialize form with current user data
  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name || '',
    },
  })

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateUser.mutateAsync({
        userId: user.id,
        name: data.name.trim(),
      })
      
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  // Reset form when dialog opens with current user data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset({
        name: user.name || '',
      })
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit3 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Make changes to the user profile.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="text-sm">{user.email}</div>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter user name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateUser.isPending || !form.formState.isDirty}
              >
                {updateUser.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
