import { useState } from "react"
import { Building, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { organization } from "@/lib/auth-client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const createBusinessAccountSchema = z.object({
  name: z.string()
    .min(2, "Organization name must be at least 2 characters")
    .max(50, "Organization name must be less than 50 characters"),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
})

type CreateBusinessAccountFormData = z.infer<typeof createBusinessAccountSchema>

interface CreateBusinessAccountDialogProps {
  trigger?: React.ReactNode
}

export function CreateBusainessAccountDialog({ trigger }: CreateBusinessAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateBusinessAccountFormData>({
    resolver: zodResolver(createBusinessAccountSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  })

  const onSubmit = async (data: CreateBusinessAccountFormData) => {
    setIsLoading(true)
    try {
      const result = await organization.create({
        name: data.name,
        slug: data.slug || "",
      })

      if (result.error) {
        console.error("Failed to create organization:", result.error)
        throw new Error(result.error.message || "Failed to create organization")
      }

      toast.success("Organization created successfully")
      
      // Invalidate organization queries
      await queryClient.invalidateQueries({ queryKey: ["organizations"] })
      await queryClient.invalidateQueries({ queryKey: ["active-organization"] })
      
      // Set the new organization as active
      if (result.data?.id) {
        await organization.setActive({
          organizationId: result.data.id,
        })
      }

      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to create organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create organization")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
    
    form.setValue('slug', slug)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Business Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Create Business Account
          </DialogTitle>
          <DialogDescription>
            Create a new business account for your business. You'll be the owner of this business account.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Account Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Acme Corp" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your business account's display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Account Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="acme-corp" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for your business account URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Business Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}