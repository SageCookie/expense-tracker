import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function BarChartComponent({ data, dataKey, fill = '#6366f1' }) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={fill} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PieChartComponent({ data, colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'], symbol = '$' }) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${symbol}${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${symbol}${Number(value).toFixed(2)}`} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function LineChartComponent({ data, dataKey, stroke = '#6366f1' }) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ fill: stroke, r: 5 }} activeDot={{ r: 7 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}