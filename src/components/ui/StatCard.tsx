interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg?: string
  sub?: string
}

export default function StatCard({ label, value, icon, iconBg = 'bg-blue-50', sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}