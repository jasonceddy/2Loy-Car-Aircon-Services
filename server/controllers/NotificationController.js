import { prisma } from "../server.js"

export async function listNotifications(req, res) {
  try {
    const userId = req.user.userId
    const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    res.status(200).json({ data: notifications })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function markAsRead(req, res) {
  try {
    const id = parseInt(req.params.id)
    await prisma.notification.update({ where: { id }, data: { read: true } })
    res.status(200).json({ message: "Marked as read" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function createNotification(req, res) {
  try {
    const { userId, title, message, meta } = req.body
    const n = await prisma.notification.create({ data: { userId, title, message, meta } })
    res.status(201).json({ data: n })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}
