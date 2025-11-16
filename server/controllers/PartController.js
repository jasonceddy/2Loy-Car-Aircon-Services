import { prisma } from "../server.js"
export async function createPart(req, res) {
  try {
    const { name, stock, threshold, price, uom, serialNumber } = req.body

    const part = await prisma.part.create({
      data: {
        name,
        uom: uom || "pc",                     // default fallback
        serialNumber: serialNumber || null,   // unique, nullable
        price: parseFloat(price || 0),
        stock: parseInt(stock),
        threshold: parseInt(threshold),
      },
    })

    res.status(201).json({ message: "Part created successfully", data: part })
  } catch (error) {
    console.log(error)

    if (error.code === "P2002") {
      return res.status(400).json({
        message: {
          serialNumber: ["Serial number already exists"],
        },
      })
    }

    res.status(500).json({ message: "Server error" })
  }
}

// UPDATE PART
export async function updatePart(req, res) {
  try {
    const { id } = req.params
    const { name, threshold, price, uom, serialNumber } = req.body

    const part = await prisma.part.update({
      where: { id: parseInt(id) },
      data: {
        name,
        uom: uom || "pc",
        serialNumber: serialNumber || null,
        threshold: parseInt(threshold),
        ...(price !== undefined && { price: parseFloat(price) }),
      },
    })

    res.status(200).json({ message: "Part updated successfully", data: part })
  } catch (error) {
    console.log(error)

    if (error.code === "P2002") {
      return res.status(400).json({
        message: {
          serialNumber: ["Serial number already exists"],
        },
      })
    }

    res.status(500).json({ message: "Server error" })
  }
}

export async function stockIn(req, res) {
  const { id } = req.params
  const { quantity } = req.body

  const part = await prisma.part.update({
    where: { id: parseInt(id) },
    data: { stock: { increment: parseInt(quantity) } },
  })

  await prisma.inventoryLog.create({
    data: {
      partId: parseInt(id),
      quantity: parseInt(quantity),
      type: "IN",
    },
  })

  res.status(200).json({ message: "Stock in successful!" })
}

export async function stockOut(req, res) {
  const { id } = req.params
  const { quantity } = req.body
  const qty = parseInt(quantity)

  const part = await prisma.part.findUnique({
    where: { id: parseInt(id) },
  })

  if (!part) {
    return res.status(404).json({ message: "Part not found" })
  }

  if (part.stock < qty) {
    return res.status(400).json({
      message: `Not enough stock. Current stock: ${part.stock}, requested: ${qty}`,
    })
  }

  const updatedPart = await prisma.part.update({
    where: { id: parseInt(id) },
    data: { stock: { decrement: qty } },
  })

  await prisma.inventoryLog.create({
    data: {
      partId: parseInt(id),
      quantity: qty,
      type: "OUT",
    },
  })

  res.status(200).json({ message: "Stock out successful!" })
}

export async function getParts(req, res) {
  const { search = "", page = 1, limit = 10, sort = "id_desc" } = req.query

  const pageNumber = parseInt(page)
  const pageSize = parseInt(limit)
  const skip = (pageNumber - 1) * pageSize

  let where = search
    ? {
        OR: [{ name: { contains: search } }],
      }
    : {}

  let orderBy
  switch (sort) {
    case "id_asc":
      orderBy = { id: "asc" }
      break
    case "id_desc":
      orderBy = { id: "desc" }
      break
    default:
      orderBy = { id: "desc" }
  }

  const [parts, count] = await prisma.$transaction([
    prisma.part.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.part.count({ where }),
  ])

  res.status(200).json({
    data: parts,
    count,
    page: pageNumber,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  })
}

export async function getInventoryLogs(req, res) {
  const {
    search = "",
    page = 1,
    limit = 10,
    sort = "latest",
    type = "",
  } = req.query

  const pageNumber = parseInt(page)
  const pageSize = parseInt(limit)
  const skip = (pageNumber - 1) * pageSize

  let where = {}

  // Search by part name
  if (search) {
    where = {
      ...where,
      part: {
        name: {
          contains: search,
        },
      },
    }
  }

  // Filter by type (stock-in, stock-out, etc.)
  if (type !== null && type !== undefined && type !== "") {
    where.type = type
  }

  // Sorting
  let orderBy
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" }
      break
    case "latest":
    default:
      orderBy = { createdAt: "desc" }
      break
  }

  const [logs, count] = await prisma.$transaction([
    prisma.inventoryLog.findMany({
      where,
      include: { part: true },
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.inventoryLog.count({ where }),
  ])

  res.status(200).json({
    data: logs,
    count,
    page: pageNumber,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  })
}

export async function getAllParts(req, res) {
  const parts = await prisma.part.findMany()
  res.status(200).json({ parts })
}