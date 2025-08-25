import { stats } from "@/data/constants"

interface StatItemProps {
  value: string
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center text-white">
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
