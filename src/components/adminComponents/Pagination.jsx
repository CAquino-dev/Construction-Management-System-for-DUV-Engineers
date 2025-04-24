import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "../ui/pagination";
import React from "react";

const PaginationComponent = ({ currentPage, totalPages, setCurrentPage }) => {
  const generatePageNumbers = () => {
    let pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent className="flex items-center justify-center gap-2 mt-4">

        {/* First Page */}
        <PaginationItem>
          <PaginationLink
            onClick={() => currentPage > 1 && setCurrentPage(1)}
            className={`cursor-pointer px-6 py-2 rounded-md hover:bg-gray-300 ${
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
            className={`cursor-pointer px-6 py-2 rounded-md hover:bg-gray-300 ${
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
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                className={`cursor-pointer px-4 py-2 rounded-md ${
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
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            className={`cursor-pointer px-6 py-2 rounded-md hover:bg-gray-300 ${
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
            className={`cursor-pointer px-6 py-2 rounded-md hover:bg-gray-300 ${
              currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Last &raquo;
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
