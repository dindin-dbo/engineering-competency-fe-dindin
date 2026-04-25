import { PaginationMeta } from '@/types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, total_pages } = meta

  if (total_pages <= 1) return null

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-gray-500">
        Halaman {page} dari {total_pages} ({meta.total_items} data)
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="
            px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200
            text-gray-600 hover:bg-gray-50 disabled:opacity-40
            disabled:cursor-not-allowed transition-colors
          "
        >
          Sebelumnya
        </button>

        {Array.from({ length: total_pages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === total_pages || Math.abs(p - page) <= 1)
          .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
            acc.push(p)
            return acc
          }, [])
          .map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-xs">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`
                  w-8 h-8 rounded-lg text-xs font-medium transition-colors
                  ${p === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {p}
              </button>
            )
          )
        }

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="
            px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200
            text-gray-600 hover:bg-gray-50 disabled:opacity-40
            disabled:cursor-not-allowed transition-colors
          "
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}