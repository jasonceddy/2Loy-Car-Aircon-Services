import { prisma } from "../server.js"
export async function getBookingsOverview(req, res) {
  try {
    const today = new Date()

    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const [todayCount, weekCount, pending, confirmed, cancelled] =
      await Promise.all([
        prisma.booking.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.booking.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.count({ where: { status: "CANCELLED" } }),
      ])

    res.json({
      today: todayCount,
      thisWeek: weekCount,
      pending,
      confirmed,
      cancelled,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/jobs-overview
export async function getJobsOverview(req, res) {
  try {
    const [diagnostic, repair, testing, completion] = await Promise.all([
      prisma.job.count({ where: { stage: "DIAGNOSTIC" } }),
      prisma.job.count({ where: { stage: "REPAIR" } }),
      prisma.job.count({ where: { stage: "TESTING" } }),
      prisma.job.count({ where: { stage: "COMPLETION" } }),
    ])

    res.json({ diagnostic, repair, testing, completion })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/revenue-summary
export async function getRevenueSummary(req, res) {
  try {
    // Use non-mutating date calculations to avoid accidental range bugs
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Use billing totals (invoiced amounts) as the source of service revenue.
    const [todayBillingsAgg, monthBillingsAgg, unpaidAgg, paidAgg] = await Promise.all([
      prisma.billing.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.billing.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfMonth, lte: endOfDay } } }),
      prisma.billing.aggregate({ _sum: { total: true }, where: { status: "UNPAID" } }),
      prisma.billing.aggregate({ _sum: { total: true }, where: { status: "PAID" } }),
    ])

    const billingsToday = todayBillingsAgg._sum.total || 0
    const billingsThisMonth = monthBillingsAgg._sum.total || 0

    // compute parts cost (sum of quantity * part.price) for jobs updated in the same ranges
    const [partsToday, partsMonth] = await Promise.all([
      prisma.partsUsed.findMany({
        where: { job: { updatedAt: { gte: startOfDay, lte: endOfDay } } },
        include: { part: { select: { price: true } } },
      }),
      prisma.partsUsed.findMany({
        where: { job: { updatedAt: { gte: startOfMonth, lte: endOfDay } } },
        include: { part: { select: { price: true } } },
      }),
    ])

    const sumPartsCost = (items) =>
      items.reduce((acc, it) => acc + (it.quantity || 0) * (it.part?.price || 0), 0)

    const partsCostToday = sumPartsCost(partsToday)
    const partsCostThisMonth = sumPartsCost(partsMonth)

    // revenue = payments (service revenue) - parts cost
  // revenue = invoiced (billing totals) - parts cost
  const revenueToday = billingsToday - partsCostToday
  const revenueThisMonth = billingsThisMonth - partsCostThisMonth

    // include invoiced totals explicitly as well
    const invoicedThisMonth = billingsThisMonth

    res.json({
      today: revenueToday || 0,
      thisMonth: revenueThisMonth || 0,
      unpaid: unpaidAgg._sum.total || 0,
      paid: paidAgg._sum.total || 0,
      invoicedThisMonth,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/trends
export async function getTrends(req, res) {
  try {
    // Last 6 months including current month
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      months.push({ dateKey: key, monthStart: d })
    }

    // Fetch billings created in the 6-month window and partsUsed for jobs updated in same window
    const windowStart = months[0].monthStart
    const [billings, partsUsed] = await Promise.all([
      prisma.billing.findMany({ where: { createdAt: { gte: windowStart } }, select: { total: true, createdAt: true } }),
      prisma.partsUsed.findMany({ where: { job: { updatedAt: { gte: windowStart } } }, include: { part: { select: { price: true } }, job: { select: { updatedAt: true } } } }),
    ])

    const toMonthKey = (d) => {
      const dt = new Date(d)
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
    }

    const billingsByMonth = billings.reduce((acc, b) => {
      const key = toMonthKey(b.createdAt)
      acc[key] = (acc[key] || 0) + (b.total || 0)
      return acc
    }, {})

    const partsByMonth = partsUsed.reduce((acc, pu) => {
      const key = toMonthKey(pu.job.updatedAt)
      const cost = (pu.quantity || 0) * (pu.part?.price || 0)
      acc[key] = (acc[key] || 0) + cost
      return acc
    }, {})

    const revenueArray = months.map((m) => ({ date: m.dateKey, amount: (billingsByMonth[m.dateKey] || 0) - (partsByMonth[m.dateKey] || 0) }))
    // For bookings count per month
    const bookings = await prisma.booking.findMany({ where: { createdAt: { gte: windowStart } }, select: { createdAt: true } })
    const bookingsByMonth = bookings.reduce((acc, b) => {
      const key = toMonthKey(b.createdAt)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const bookingsArray = months.map((m) => ({ date: m.dateKey, count: bookingsByMonth[m.dateKey] || 0 }))

    res.json({ bookings: bookingsArray, revenue: revenueArray })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/low-stock
export async function getLowStock(req, res) {
  try {
    const lowStockParts = await prisma.part.findMany({
      where: {
        stock: {
          lte: prisma.part.fields.threshold,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        threshold: true,
      },
      orderBy: { stock: "asc" },
    })

    const filtered = lowStockParts.filter((p) => p.stock <= p.threshold)

    res.json(filtered)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DEBUG: GET /dashboard/debug
// Returns raw payments and partsUsed and per-day aggregates for the last 7 days
export async function getRevenueDebug(req, res) {
  try {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)

    const [paymentsRaw, partsUsed] = await Promise.all([
      prisma.payment.findMany({ where: { paidAt: { gte: startDate } }, select: { id: true, amount: true, paidAt: true, billingId: true } }),
      prisma.partsUsed.findMany({ where: { job: { updatedAt: { gte: startDate } } }, include: { part: { select: { id: true, name: true, price: true } }, job: { select: { id: true, updatedAt: true } } } }),
    ])

    const toDateKey = (d) => new Date(d).toISOString().split("T")[0]

    const paymentsByDate = paymentsRaw.reduce((acc, p) => {
      const key = toDateKey(p.paidAt)
      acc[key] = (acc[key] || 0) + (p.amount || 0)
      return acc
    }, {})

    const partsByDate = partsUsed.reduce((acc, pu) => {
      const key = toDateKey(pu.job.updatedAt)
      const cost = (pu.quantity || 0) * (pu.part?.price || 0)
      acc[key] = (acc[key] || 0) + cost
      return acc
    }, {})

    res.json({
      startDate: startDate.toISOString().split("T")[0],
      paymentsRaw,
      partsUsed,
      paymentsByDate,
      partsByDate,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}