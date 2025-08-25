import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/orphaned-resources')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/orphaned-resources"!</div>
}
