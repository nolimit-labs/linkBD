import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Loader2 
} from 'lucide-react'
import { useAdminProfileTodos } from '@/api/profile'

interface ProfileTodosProps {
  profileId: string
  profileType: 'user' | 'organization'
}

export function ProfileTodos({ profileId, profileType }: ProfileTodosProps) {
  const { data, isLoading, error } = useAdminProfileTodos(profileId)

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
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Failed to load todos
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { todos, stats } = data

  return (
    <div className="h-full flex flex-col">
      {/* Header with total count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Todos</h3>
        <div className="text-sm text-muted-foreground">
          {stats.totalTodos} total
        </div>
      </div>

      {/* Scrollable Todos List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {todos.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No todos found
              </p>
            </div>
          </div>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {todo.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </h4>
                      <Badge variant={todo.completed ? 'outline' : 'secondary'} className="text-xs">
                        {todo.completed ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                    {todo.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {todo.description}
                      </p>
                    )}
                    {todo.imageUrl && (
                      <img 
                        src={todo.imageUrl} 
                        alt="Todo attachment" 
                        className="mt-2 max-w-full h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                      {todo.updatedAt !== todo.createdAt && (
                        <span>Updated {new Date(todo.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}