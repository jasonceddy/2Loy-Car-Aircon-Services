import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { Calendar, Briefcase, DollarSign, AlertTriangle } from "lucide-react"
import axiosClient from "@/axiosClient"

export default function AdminDashboard() {
  // --- State ---
  const [bookingsOverview, setBookingsOverview] = useState({})
  const [jobsOverview, setJobsOverview] = useState([])
  const [revenueSummary, setRevenueSummary] = useState({})
  const [bookingsTrend, setBookingsTrend] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [lowStock, setLowStock] = useState([])

  const COLORS = ["#fbbf24", "#3b82f6", "#10b981", "#6b7280"]

  // --- Fetch Dashboard Data ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, jobsRes, revenueRes, trendsRes, lowStockRes] =
          await Promise.all([
            axiosClient.get("/dashboard/bookings-overview"),
            axiosClient.get("/dashboard/jobs-overview"),
            axiosClient.get("/dashboard/revenue-summary"),
            axiosClient.get("/dashboard/trends"),
            axiosClient.get("/dashboard/low-stock"),
          ])

        setBookingsOverview(bookingsRes.data)
        setJobsOverview(jobsRes.data)
        setRevenueSummary(revenueRes.data)
        setBookingsTrend(trendsRes.data.bookings)
        // Accept either monthly (YYYY-MM) or daily (YYYY-MM-DD) revenue arrays
        try {
          const serverRevenue = Array.isArray(trendsRes.data.revenue) ? trendsRes.data.revenue : []
          if (serverRevenue.length === 0) {
            setRevenueTrend([])
          } else {
            const sampleKey = serverRevenue[0].date || ""
            // detect monthly format YYYY-MM
            const isMonthly = /^\d{4}-\d{2}$/.test(sampleKey)
            if (isMonthly) {
              // ensure numeric amounts
              setRevenueTrend(serverRevenue.map((r) => ({ date: r.date, amount: Number(r.amount) || 0 })))
            } else {
              // fallback: daily => normalize to last 7 days (existing behavior)
              const revenueMap = serverRevenue.reduce((acc, r) => { acc[r.date] = Number(r.amount) || 0; return acc }, {})
              const now = new Date()
              const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
              const ordered = []
              for (let i = 0; i < 7; i++) {
                const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
                const key = d.toISOString().split("T")[0]
                ordered.push({ date: key, amount: revenueMap[key] || 0 })
              }
              setRevenueTrend(ordered)
            }
          }
        } catch (e) {
          console.error("Failed to normalize revenue trend", e)
          setRevenueTrend([])
        }
        setLowStock(lowStockRes.data)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="flex-1 p-4 border-t bg-gray-100/50">
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Bookings Today</p>
                <h2 className="text-2xl font-bold">
                  {bookingsOverview.today || 0}
                </h2>
              </div>
              <Calendar className="text-blue-500" size={28} />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <h2 className="text-2xl font-bold">
                  {(jobsOverview.diagnostic || 0) +
                    (jobsOverview.repair || 0) +
                    (jobsOverview.testing || 0)}
                </h2>
              </div>
              <Briefcase className="text-green-500" size={28} />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Unpaid Bills</p>
                <h2 className="text-2xl font-bold">
                  {revenueSummary.unpaid || 0}
                </h2>
              </div>
              <DollarSign className="text-red-500" size={28} />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Low Stock Parts</p>
                <h2 className="text-2xl font-bold">{lowStock.length}</h2>
              </div>
              <AlertTriangle className="text-yellow-500" size={28} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bookings Trend */}
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Bookings (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bookingsTrend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Job Stage Distribution */}
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Job Stages</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Diagnostic",
                        value: jobsOverview.diagnostic || 0,
                      },
                      { name: "Repair", value: jobsOverview.repair || 0 },
                      { name: "Testing", value: jobsOverview.testing || 0 },
                      {
                        name: "Completion",
                        value: jobsOverview.completion || 0,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Revenue (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* Smooth, waving area chart with baseline */}
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => new Intl.NumberFormat().format(value)} />
                {/** baseline = first day's revenue (visual reference) */}
                <ReferenceLine
                  y={revenueTrend?.[0]?.amount || 0}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  label={{ value: "Baseline", position: "insideBottom", offset: 12 }}
                />
                <Area type="basis" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
