import React from 'react';

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const handleFirst = () => setCurrentPage(1);
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleLast = () => setCurrentPage(totalPages);

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
    <div className='flex justify-end items-center gap-2 mt-4'>
      <button 
        onClick={handleFirst} 
        disabled={currentPage === 1} 
        className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer ${currentPage === 1 ? 'bg-gray-300 text-gray-500' : 'bg-gray-500 text-white'}`}
      >
        &laquo; {/* << First Page */}
      </button>

      <button 
        onClick={handlePrev} 
        disabled={currentPage === 1} 
        className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer ${currentPage === 1 ? 'bg-gray-300 text-gray-500' : 'bg-gray-500 text-white'}`}
      >
        &lt; {/* < Previous */}
      </button>

      {generatePageNumbers().map((page, index) => (
        <button 
          key={index}
          onClick={() => typeof page === 'number' && setCurrentPage(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${currentPage === page ? 'bg-gray-600 text-white' : 'bg-gray300 text-gray-700'}`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages} 
        className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer ${currentPage === totalPages ? 'bg-gray-300 text-gray-500' : 'bg-gray-500 text-white'}`}
      >
        &gt; {/* > Next */}
      </button>

      <button 
        onClick={handleLast} 
        disabled={currentPage === totalPages} 
        className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer ${currentPage === totalPages ? 'bg-gray-300 text-gray-500' : 'bg-gray-500 text-white'}`}
      >
        &raquo; {/* >> Last Page */}
      </button>
    </div>
  );
};

export default Pagination;
