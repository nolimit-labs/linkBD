import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowUpDown, Trash2, ImageIcon } from "lucide-react";
import { useTodos, useToggleTodo, useDeleteTodo } from "@/api";
import { NewTodoDialog } from "./new-todo-dialog";
import { TodoImage } from "./todo-image";

// Todo type based on our API structure
interface Todo {
  id: string;
  title: string;
  description?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function TodosTableView() {
  // Component State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Data Fetching & Mutations
  const { data: todos = [], isLoading } = useTodos();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  // Define columns inline with memoization
  const columns = useMemo<ColumnDef<Todo>[]>(() => [
    // Checkbox column for completion status
    {
      accessorKey: "completed",
      header: "Status",
      cell: ({ row }) => {
        const todo = row.original;
        
        return (
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => toggleTodo.mutate(todo.id)}
            className="flex-shrink-0"
          />
        );
      },
      enableSorting: false,
    },
    // Title column with sorting
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const todo = row.original;
        return (
          <div className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
            {row.getValue("title")}
          </div>
        );
      },
    },
    // Image column
    {
      accessorKey: "imageKey",
      header: "Image",
      cell: ({ row }) => {
        const todo = row.original;
        const [showFullImage, setShowFullImage] = useState(false);
        
        if (!todo.imageKey) {
          return (
            <div className="flex items-center justify-center h-12 w-12">
              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          );
        }
        
        return (
          <>
            <TodoImage 
              imageUrl={todo.imageUrl}
              className="h-12 w-12 cursor-pointer"
              onClick={() => setShowFullImage(true)}
            />
            <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
              <DialogContent className="max-w-4xl">
                <TodoImage 
                  imageUrl={todo.imageUrl}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </DialogContent>
            </Dialog>
          </>
        );
      },
      enableSorting: false,
    },
    // Description column
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const todo = row.original;
        const description = row.getValue("description") as string;
        
        if (!description) {
          return <div className="text-muted-foreground">No description</div>;
        }
        
        return (
          <div className={`text-sm ${todo.completed ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'}`}>
            {description}
          </div>
        );
      },
    },
    // Created date column with sorting
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>;
      },
    },
    // Actions column
    {
      id: "actions",
      cell: ({ row }) => {
        const todo = row.original;
        
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTodo.mutate(todo.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [toggleTodo, deleteTodo]);

  const table = useReactTable<Todo>({
    data: todos,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading todos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Filter and New Todo Button */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search todos..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} todo(s)
          </div>
          <NewTodoDialog />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No todos found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}