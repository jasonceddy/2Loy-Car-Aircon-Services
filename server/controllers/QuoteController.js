import { prisma } from "../server.js"
export async function createQuote(req, res) {
  const { id } = req.params
  const { amount, details } = req.body

  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
  })

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" })
  }

  if (!amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ message: "Invalid or missing amount" })
  }

  // Provide a default details string if not supplied
  const detailsText = details || `Quote for booking #${id} - ${booking.service?.name || booking.pack?.name || 'Package'}`

  const quote = await prisma.quote.create({
    data: {
      bookingId: parseInt(id),
      total: parseFloat(amount),
      customerId: booking.customerId,
      details: detailsText,
    },
  })

  // Debug: log quote creation and current payments/billing aggregates
  try {
    const paymentsAgg = await prisma.payment.aggregate({ _sum: { amount: true } })
    const billingsAgg = await prisma.billing.aggregate({ _sum: { total: true } })
    console.log(`[QuoteController] Quote created id=${quote.id} total=${quote.total}`)
    console.log(`[QuoteController] Payments total sum=${paymentsAgg._sum.amount || 0}`)
    console.log(`[QuoteController] Billings total sum=${billingsAgg._sum.total || 0}`)
  } catch (e) {
    console.error('[QuoteController] Failed to log aggregates', e)
  }

  res.status(200).json({ message: "Quote created successfully", data: quote })
}

export async function acceptQuote(req, res) {
  const { id } = req.params

  const quote = await prisma.quote.findUnique({
    where: { id: parseInt(id) },
  })

  if (!quote) {
    return res.status(404).json({ message: "Quote not found" })
  }

  const acceptQuote = await prisma.quote.update({
    where: { id: parseInt(id) },
    data: { status: "APPROVED" },
  })

  const billing = await prisma.billing.create({
    data: {
      quoteId: parseInt(id),
      total: quote.total,
    },
  })

  res.status(200).json({ message: "Quote accepted successfully" })
}

export async function deleteQuote(req, res) {
  const { id } = req.params

  const quote = await prisma.quote.findUnique({
    where: { id: parseInt(id) },
  })

  if (!quote) {
    return res.status(404).json({ message: "Quote not found" })
  }

  const deleteQuote = await prisma.quote.delete({
    where: { id: parseInt(id) },
  })

  res.status(200).json({ message: "Quote deleted successfully" })
}

export async function updateQuote(req, res) {
  const { id } = req.params
  const { amount, details, status } = req.body

  const quote = await prisma.quote.findUnique({ where: { id: parseInt(id) } })
  if (!quote) return res.status(404).json({ message: "Quote not found" })

  const data = {}
  if (amount !== undefined) data.total = parseFloat(amount)
  if (details !== undefined) data.details = details
  if (status !== undefined) data.status = status

  const updated = await prisma.quote.update({ where: { id: parseInt(id) }, data })

  // If status moved to APPROVED, create a billing (finalize)
  if (status === "APPROVED") {
    await prisma.billing.create({ data: { quoteId: parseInt(id), total: updated.total } })
  }

  res.json({ message: "Quote updated", data: updated })
}

export async function sendQuote(req, res) {
  const { id } = req.params

  const quote = await prisma.quote.findUnique({ where: { id: parseInt(id) }, include: { customer: true, booking: true } })
  if (!quote) return res.status(404).json({ message: "Quote not found" })

  // Create a notification for the customer
  try {
    await prisma.notification.create({
      data: {
        userId: quote.customerId,
        title: `New quote for booking #${quote.bookingId}`,
        message: `A new quote of ${quote.total} has been issued. Check your dashboard to review.`,
        meta: { quoteId: quote.id, bookingId: quote.bookingId },
      },
    })
  } catch (e) {
    console.error("Failed to create notification for quote send", e)
  }

  res.json({ message: "Quote sent to customer" })
}