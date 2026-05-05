interface Column<T> {
  header: string
  align?: 'left' | 'center' | 'right'
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  mobileCard: (row: T) => React.ReactNode
}

export default function Table<T>({ columns, data, keyExtractor, mobileCard }: TableProps<T>) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`
                    ${alignClass[col.align ?? 'left']} px-5 py-3
                    text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={`px-5 py-3.5 ${alignClass[col.align ?? 'left']}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {data.map((row) => (
          <div key={keyExtractor(row)} className="px-4 py-4">
            {mobileCard(row)}
          </div>
        ))}
      </div>
    </>
  )
}