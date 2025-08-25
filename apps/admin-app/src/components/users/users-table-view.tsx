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
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { useGetAllUsersAsAdmin } from "@/api/user";
import { UserActions } from "./user-actions";
import { Link } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUserSubscription } from "@/api/subscriptions";


export function UsersTableView() {
  // Component State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Data Fetching
  const { data, isLoading } = useGetAllUsersAsAdmin();
  const updateSubscription = useUpdateUserSubscription();
  
  const list = data?.users ?? [];
  type User = (typeof list)[number];

  // Table Columns
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link 
          to="/profile/$id" 
          params={{ id: row.original.id }}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.getValue("email")}
        </Link>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.role}
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => {
        const user = row.original;
        const plan = user.plan;
        const currentPlan = plan?.name || 'free';
        
        // Handle subscription update
        const handlePlanChange = (newPlan: string) => {
          if (newPlan === 'pro') {
            // Don't allow selecting pro plan
            return;
          }
          
          if (newPlan !== currentPlan) {
            updateSubscription.mutate({
              userId: user.id,
              plan: newPlan as 'free' | 'pro_complementary'
            });
          }
        };
        
        return (
          <div className="flex flex-col gap-2">
            <Select
              value={currentPlan}
              onValueChange={handlePlanChange}
              disabled={updateSubscription.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro_complementary">Pro Complementary</SelectItem>
                <SelectItem value="pro" disabled>
                  <span className="flex items-center gap-2">
                    Pro
                    <span className="text-xs text-muted-foreground">(Requires payment)</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {plan?.status && (
              <span className="text-xs text-muted-foreground capitalize">
                Status: {plan.status}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "organizations",
      header: "Organizations",
      cell: ({ row }) => {
        const orgs = row.original.organizations || [];
        if (orgs.length === 0) return <span className="text-muted-foreground">None</span>;
        return (
          <div className="flex flex-col gap-1">
            {orgs.map((org: any) => (
              <span key={org.organizationId} className="text-sm">
                {org.organizationName || org.organizationId} 
                {org.role && <span className="text-muted-foreground ml-1">({org.role})</span>}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <UserActions user={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  const table = useReactTable<User>({
    data: list,
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
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search users..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} user(s)
        </div>
      </div>

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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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