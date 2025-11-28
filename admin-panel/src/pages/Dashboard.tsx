import { useQuery } from '@tanstack/react-query'
import { statsAPI } from '../api/client'
import { FileText, Users, Eye, TrendingUp } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export const Dashboard: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsAPI.getDashboardStats(),
  })

  // Mock data для демонстрации (заменится реальными данными)
  const mockStats = {
    totalCases: 50,
    totalUsers: 1250,
    totalViews: 12500,
    recentCases: [
      { id: '1', title: 'The Zodiac Killer', views: 450, createdAt: '2024-01-15' },
      { id: '2', title: 'Madeleine McCann', views: 380, createdAt: '2024-01-14' },
    ],
    viewsByDay: [
      { date: '01.01', views: 120 },
      { date: '02.01', views: 150 },
      { date: '03.01', views: 180 },
      { date: '04.01', views: 200 },
      { date: '05.01', views: 220 },
      { date: '06.01', views: 250 },
      { date: '07.01', views: 280 },
    ],
  }

  const statsData = stats || mockStats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Обзор статистики и активности</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Всего кейсов"
          value={statsData.totalCases}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={Users}
          label="Пользователей"
          value={statsData.totalUsers}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={Eye}
          label="Просмотров"
          value={statsData.totalViews.toLocaleString()}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Рост"
          value="+12%"
          color="text-darkcase-crimson"
          bgColor="bg-darkcase-crimson/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Просмотры по дням</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statsData.viewsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#6D6D6D" />
              <YAxis stroke="#6D6D6D" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#DC143C"
                strokeWidth={2}
                dot={{ fill: '#DC143C' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Cases */}
        <div className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Последние кейсы</h2>
          <div className="space-y-3">
            {statsData.recentCases.map((caseItem: any) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-3 bg-darkcase-darkGray rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{caseItem.title}</p>
                  <p className="text-white/60 text-sm">{caseItem.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-darkcase-crimson font-semibold">{caseItem.views}</p>
                  <p className="text-white/60 text-xs">просмотров</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  bgColor: string
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bgColor }) => {
  return (
    <div className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={color} size={24} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-white/60 text-sm">{label}</p>
      </div>
    </div>
  )
}

