import React from 'react';

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className='flex justify-center items-center gap-4 mt-4'>
      <button 
        onClick={handlePrev} 
        disabled={currentPage === 1} 
        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'}`}
      >
        Prev
      </button>

      <span className='font-medium'>
        Page {currentPage} of {totalPages}
      </span>

      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages} 
        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'}`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
