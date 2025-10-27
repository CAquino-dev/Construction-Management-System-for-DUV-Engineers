import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../ui/pagination";
import React from "react";

const PaginationComponent = ({ currentPage, totalPages, setCurrentPage }) => {
  const generatePageNumbers = () => {
    if (totalPages <= 1) return [];

    let pages = [];
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5; // Responsive page count

    if (totalPages <= maxVisiblePages) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust for mobile to show fewer pages
      if (window.innerWidth < 768) {
        startPage = Math.max(2, currentPage);
        endPage = Math.min(totalPages - 1, currentPage);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Mobile simplified version
  const MobilePagination = () => (
    <div className="flex items-center justify-between w-full md:hidden">
      <PaginationLink
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        className={`cursor-pointer px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-1 ${
          currentPage === 1 ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <span className="text-sm">← Prev</span>
      </PaginationLink>

      <div className="flex items-center gap-1 text-sm">
        <span className="px-2 py-1 bg-[#3b5d47] text-white rounded-md">
          {currentPage}
        </span>
        <span className="text-gray-600">of</span>
        <span className="px-2 py-1">{totalPages}</span>
      </div>

      <PaginationLink
        onClick={() =>
          currentPage < totalPages && setCurrentPage(currentPage + 1)
        }
        className={`cursor-pointer px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-1 ${
          currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <span className="text-sm">Next →</span>
      </PaginationLink>
    </div>
  );

  // Desktop full version
  const DesktopPagination = () => (
    <div className="hidden md:flex items-center justify-center gap-1 lg:gap-2">
      {/* First Page */}
      <PaginationItem>
        <PaginationLink
          onClick={() => currentPage > 1 && setCurrentPage(1)}
          className={`cursor-pointer px-3 lg:px-4 py-2 rounded-md hover:bg-gray-300 text-sm lg:text-base ${
            currentPage === 1 ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          &laquo; First
        </PaginationLink>
      </PaginationItem>

      {/* Previous Page */}
      <PaginationItem>
        <PaginationLink
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          className={`cursor-pointer px-3 lg:px-4 py-2 rounded-md hover:bg-gray-300 text-sm lg:text-base ${
            currentPage === 1 ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          &lt; Prev
        </PaginationLink>
      </PaginationItem>

      {/* Page Numbers */}
      {generatePageNumbers().map((page, index) => (
        <PaginationItem key={index}>
          {page === "..." ? (
            <span className="px-2 lg:px-3 py-2 text-gray-500 text-sm lg:text-base">
              ...
            </span>
          ) : (
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              className={`cursor-pointer px-3 lg:px-4 py-2 rounded-md text-sm lg:text-base ${
                currentPage === page
                  ? "bg-[#3b5d47] text-white"
                  : "hover:bg-gray-300"
              }`}
            >
              {page}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}

      {/* Next Page */}
      <PaginationItem>
        <PaginationLink
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
          className={`cursor-pointer px-3 lg:px-4 py-2 rounded-md hover:bg-gray-300 text-sm lg:text-base ${
            currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          Next &gt;
        </PaginationLink>
      </PaginationItem>

      {/* Last Page */}
      <PaginationItem>
        <PaginationLink
          onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}
          className={`cursor-pointer px-3 lg:px-4 py-2 rounded-md hover:bg-gray-300 text-sm lg:text-base ${
            currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          Last &raquo;
        </PaginationLink>
      </PaginationItem>
    </div>
  );

  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent className="w-full">
        {/* Mobile View */}
        <MobilePagination />

        {/* Desktop View */}
        <DesktopPagination />
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
