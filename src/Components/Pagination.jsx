import React from "react";

const Pagination = ({ pagination, setPagination, isLoading }) => {
  const { pageNumber, pageSize, totalCount } = pagination;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, pageNumber: newPage }));
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageNumber <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (pageNumber >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          pageNumber - 1,
          pageNumber,
          pageNumber + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-2 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      <button
        className={`flex items-center justify-center h-7 w-7 rounded-md border border-gray-300 transition-colors duration-200 shadow-md ${
          pageNumber === 1 || isLoading
            ? "opacity-50 cursor-not-allowed text-gray-400"
            : "text-gray-600 hover:bg-gray-100 hover:border-gray-400"
        }`}
        disabled={pageNumber === 1 || isLoading}
        onClick={() => handlePageChange(pageNumber - 1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {renderPageNumbers().map((page, index) => (
        <button
          key={index}
          className={`px-3 border font-semibold shadow-lg transform transition ${
            page === pageNumber
              ? "bg-purple-600 text-white border-gray-400 hover:scale-110"
              : "border-gray-400 text-gray-600 hover:bg-gray-300"
          }`}
          onClick={() => typeof page === "number" && handlePageChange(page)}
          disabled={page === "..." || isLoading}
        >
          {page}
        </button>
      ))}

      <button
        className={`flex items-center justify-center h-7 w-7 rounded-md border border-gray-300 transition-colors duration-200 shadow-md ${
          pageNumber === totalPages || isLoading
            ? "opacity-50 cursor-not-allowed text-gray-400"
            : "text-gray-600 hover:bg-gray-100 hover:border-gray-400"
        }`}
        disabled={pageNumber === totalPages || isLoading}
        onClick={() => handlePageChange(pageNumber + 1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
