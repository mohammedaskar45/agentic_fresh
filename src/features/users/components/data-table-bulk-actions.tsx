import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DataTableBulkActionsProps = {
  table: Table<any>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const { getSelectedRowModel } = table
  const selectedRows = getSelectedRowModel().rows

  if (selectedRows.length === 0) return null

  return (
    <div className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-background p-2 shadow-lg'>
      <span className='px-2 text-sm text-muted-foreground'>
        {selectedRows.length} selected
      </span>
      <Button
        variant='destructive'
        size='sm'
        className='h-8'
        onClick={() => {
          // Bulk delete logic can be added here
          console.log('Delete rows:', selectedRows.map((r) => r.original))
        }}
      >
        <Trash2 className='mr-2 h-4 w-4' />
        Delete
      </Button>
    </div>
  )
}
