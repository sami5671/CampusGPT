'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  pageSizeOptions?: number[]
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationControlsProps) {
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/40 bg-card/40 backdrop-blur-sm text-xs">
      {/* Left side: Item count summary & per-page selector */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <div>
          Showing <span className="font-bold text-foreground">{startItem}</span> to{' '}
          <span className="font-bold text-foreground">{endItem}</span> of{' '}
          <span className="font-bold text-foreground">{totalItems}</span> entries
        </div>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-background/80 border border-border/40 text-foreground rounded-lg px-2 py-1 outline-none font-medium cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size} className="bg-card text-foreground">
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}
      </div>

      {/* Right side: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 rounded-lg border-border/40 bg-background/50 hover:bg-primary/20 hover:text-primary transition disabled:opacity-40"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 rounded-lg border-border/40 bg-background/50 hover:bg-primary/20 hover:text-primary transition disabled:opacity-40"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-muted-foreground select-none">
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`h-8 min-w-[32px] px-2.5 rounded-lg font-semibold text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20'
                  : 'bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
              }`}
            >
              {pageNum}
            </button>
          )
        })}

        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8 rounded-lg border-border/40 bg-background/50 hover:bg-primary/20 hover:text-primary transition disabled:opacity-40"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8 rounded-lg border-border/40 bg-background/50 hover:bg-primary/20 hover:text-primary transition disabled:opacity-40"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
