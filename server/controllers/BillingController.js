import { prisma } from "../server.js"
export async function addPayment(req, res) {
  const { id } = req.params

  const { amount, method } = req.body

  if (!amount || !method) {
    return res.status(400).json({ message: "Amount and method are required" })
  }

  const payment = await prisma.payment.create({
    data: {
      amount: parseFloat(amount),
      method,
      billingId: parseInt(id),
    },
  })

  res.status(201).json({ message: "Payment added successfully", payment })
}

export async function paidBilling(req, res) {
  const { id } = req.params

  const billing = await prisma.billing.update({
    where: { id: parseInt(id) },
    data: { status: "PAID" },
  })

  res.status(200).json({ message: "Billing paid successfully" })
}