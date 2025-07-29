"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Search, Settings2, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const hiddenColumnsCount = table.getAllColumns().filter((column) => !column.getIsVisible()).length
  const searchColumn = searchKey ? table.getColumn(searchKey) : null
  const searchValue = (searchColumn?.getFilterValue() as string) ?? ""

  // Helper function to format column names
  const formatColumnName = (columnId: string) => {
    const columnNameMap: Record<string, string> = {
      voucher_no: "Voucher No",
      date: "Date",
      paid_to: "Paid To",
      total_amount: "Amount",
      amount: "Amount",
      check_no: "Check No",
      status: "Status",
      actions: "Actions",
      account_name: "Account Name",
      account_number: "Account Number",
      bank_amount: "Bank Amount",
    }

    return (
      columnNameMap[columnId] ||
      columnId
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {/* Search */}
          {searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => searchColumn?.setFilterValue(event.target.value)}
                className="pl-9 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => searchColumn?.setFilterValue("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Column Controls */}
          <div className="flex items-center gap-2">
            {hiddenColumnsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {hiddenColumnsCount} hidden
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 bg-transparent">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Show/Hide Columns</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      table.getAllColumns().forEach((column) => {
                        if (column.getCanHide()) {
                          column.toggleVisibility(true)
                        }
                      })
                    }}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                  >
                    Show All
                  </Button>
                </DropdownMenuLabel>
                <div className="max-h-64 overflow-y-auto bg-white">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const columnName = formatColumnName(column.id)
                      const isVisible = column.getIsVisible()
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className={`flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                            isVisible
                              ? "bg-green-50 hover:bg-green-100 text-gray-900"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                          }`}
                          checked={isVisible}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            {isVisible ? (
                              <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${isVisible ? "text-gray-900" : "text-gray-500"}`}>
                              {columnName}
                            </span>
                            {isVisible && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-gray-200 bg-gray-50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-900 bg-gray-50 px-4 py-4 whitespace-nowrap"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-4 text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                      <div className="text-sm">No results found</div>
                      {searchKey && searchValue && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => searchColumn?.setFilterValue("")}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected
            {hiddenColumnsCount > 0 && (
              <span className="hidden sm:inline"> • {hiddenColumnsCount} column(s) hidden</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9"
            >
              Previous
            </Button>
            <div className="text-sm text-gray-600 px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
