import React, { useState, useMemo, ReactNode } from 'react';
import styles from './DataTable.module.css';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LoadingState } from '../LoadingState/LoadingState';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { Pagination } from '../Pagination/Pagination';

export interface Column<T> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => any);
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  enablePagination?: boolean;
  initialPageSize?: number;
  rowKey?: keyof T | ((row: T) => string);
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  enablePagination = true,
  initialPageSize = 10,
  rowKey = 'id' as keyof T,
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortColumnId === col.id) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumnId(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumnId(col.id);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumnId) return data;
    const col = columns.find((c) => c.id === sortColumnId);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (typeof col.accessor === 'function') {
        valA = col.accessor(a);
        valB = col.accessor(b);
      } else if (col.accessor) {
        valA = a[col.accessor];
        valB = b[col.accessor];
      } else {
        valA = a[col.id];
        valB = b[col.id];
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc'
        ? valA < valB ? -1 : 1
        : valA > valB ? -1 : 1;
    });
  }, [data, sortColumnId, sortDirection, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    if (row && row[rowKey]) {
      return String(row[rowKey]);
    }
    return String(index);
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortColumnId === col.id;
                const alignClass =
                  col.align === 'center'
                    ? styles.alignCenter
                    : col.align === 'right'
                    ? styles.alignRight
                    : styles.alignLeft;

                const hideClass = col.hideOnMobile ? styles.hideOnMobile : '';

                return (
                  <th
                    key={col.id}
                    style={col.width ? { width: col.width } : undefined}
                    className={`${styles.th} ${col.sortable ? styles.sortable : ''} ${alignClass} ${hideClass}`.trim()}
                    onClick={() => handleSort(col)}
                  >
                    <div className={styles.thContent}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span
                          className={`${styles.sortIcon} ${isSorted ? styles.sortActive : ''}`}
                        >
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <LoadingState />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length}>
                  <ErrorState message={errorMessage} onRetry={onRetry} />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={getRowKey(row, rowIndex)} className={styles.tr}>
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'center'
                        ? styles.alignCenter
                        : col.align === 'right'
                        ? styles.alignRight
                        : styles.alignLeft;

                    let content: ReactNode;
                    if (col.cell) {
                      content = col.cell(row, rowIndex);
                    } else if (typeof col.accessor === 'function') {
                      content = col.accessor(row);
                    } else if (col.accessor) {
                      content = row[col.accessor];
                    } else {
                      content = row[col.id];
                    }

                    const hideClass = col.hideOnMobile ? styles.hideOnMobile : '';

                    return (
                      <td key={col.id} className={`${styles.td} ${alignClass} ${hideClass}`.trim()}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && !isLoading && !isError && sortedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={sortedData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}

export default DataTable;
