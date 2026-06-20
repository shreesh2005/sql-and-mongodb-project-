import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Printer, Search } from 'lucide-react';

const DataTable = ({ columns, data, searchPlaceholder = 'Filter records...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search filtering
  const filteredData = data.filter(item => {
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Export to CSV/Excel
  const exportToCSV = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = filteredData.map(item => 
      columns.map(c => {
        const val = typeof c.accessor === 'function' ? c.accessor(item) : item[c.accessor];
        // escape commas
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'supply_chain_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF/Print
  const printTable = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Table Control Panel */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={printTable}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer size={14} />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Grid Border Layer */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800/40 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 border-b border-gray-200 dark:border-slate-800">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-xs text-gray-400">
                  No records found matching criteria.
                </td>
              </tr>
            ) : (
              currentItems.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  {columns.map((col, colIdx) => {
                    const value = typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : item[col.accessor];
                    return (
                      <td key={colIdx} className="px-6 py-3.5 whitespace-nowrap align-middle">
                        {col.cell ? col.cell(item) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`w-8 h-8 border rounded-md font-semibold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'border-gray-300 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
