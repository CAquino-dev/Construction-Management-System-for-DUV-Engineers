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
        
        <PaginationItem>
          <PaginationLink 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1} 
            className="cursor-pointer px-3 py-2"
          >
            &laquo; First
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationLink 
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="cursor-pointer px-3 py-2"
          >
            &lt; Prev
          </PaginationLink>
        </PaginationItem>

        {generatePageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            <PaginationLink 
              onClick={() => typeof page === "number" && setCurrentPage(page)} 
              active={currentPage === page}
              className="cursor-pointer px-3 py-2"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink 
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            className="cursor-pointer px-3 py-2"
          >
            Next &gt;
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationLink 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages} 
            className="cursor-pointer px-3 py-2"
          >
            Last &raquo;
          </PaginationLink>
        </PaginationItem>

      </PaginationContent>
    
    </Pagination>
  );
};

export default PaginationComponent;
