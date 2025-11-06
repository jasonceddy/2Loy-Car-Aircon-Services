import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function LogPagination({ currentPage, setCurrentPage, data }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1)
              }
            }}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Show first page */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage(1)
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Show ellipsis if needed */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Show previous page */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage(currentPage - 1)
              }}
            >
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Current page */}
        <PaginationItem>
          <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
            {currentPage}
          </PaginationLink>
        </PaginationItem>

        {/* Show next page */}
        {currentPage < data.totalPages && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage(currentPage + 1)
              }}
            >
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Show ellipsis if needed */}
        {currentPage < data.totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Show last page */}
        {currentPage < data.totalPages - 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage(data.totalPages)
              }}
            >
              {data.totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < data.totalPages) {
                setCurrentPage(currentPage + 1)
              }
            }}
            className={
              currentPage >= data.totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}