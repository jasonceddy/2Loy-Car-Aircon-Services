import { prisma } from "../server.js"
export async function getJobs(req, res) {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sort = "latest",
      stage = "", // Filter by job stage
    } = req.query

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    // Base where clause based on user role
    let baseWhere = {}
    if (req.user.role === "CUSTOMER") {
      // Customer sees jobs from their own bookings
      baseWhere = {
        booking: {
          customerId: req.user.userId,
        },
      }
    } else if (req.user.role === "TECHNICIAN") {
      // Technician sees jobs from bookings assigned to them
      baseWhere = {
        booking: {
          technicianId: req.user.userId,
        },
      }
    }
    // ADMIN sees all jobs (no additional filter)

    // Search filters - search across related booking data
    let searchWhere = {}
    if (search) {
      searchWhere = {
        OR: [
          { booking: { car: { plateNo: { contains: search } } } },
          { booking: { car: { brand: { contains: search } } } },
          { booking: { car: { model: { contains: search } } } },
          { booking: { service: { name: { contains: search } } } },
          { booking: { customer: { name: { contains: search } } } },
          { notes: { some: { content: { contains: search } } } },
        ],
      }
    }

    // Stage filter
    let stageWhere = {}
    if (stage !== null && stage !== "" && stage !== "undefined") {
      stageWhere.stage = stage
    }

    // Combine all where conditions
    const where = {
      ...baseWhere,
      ...searchWhere,
      ...stageWhere,
    }

    // Sort options
    let orderBy
    switch (sort) {
      case "latest":
        orderBy = { updatedAt: "desc" }
        break
      case "oldest":
        orderBy = { updatedAt: "asc" }
        break
      case "stage_asc":
        orderBy = { stage: "asc" }
        break
      default:
        orderBy = { updatedAt: "desc" }
    }

    const [jobs, count] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          booking: {
            include: {
              car: true,
              service: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              technician: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          notes: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5, // Limit recent notes
          },
          partsUsed: {
            include: {
              part: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ])

    res.status(200).json({
      data: jobs,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function updateJobStage(req, res) {
  try {
    const { id } = req.params
    const { stage } = req.body

    if (stage === "COMPLETION") {
      return res
        .status(400)
        .json({ error: "Cannot update stage to COMPLETION" })
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { stage },
    })
    res.status(200).json({ message: "Job stage updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function addJobNote(req, res) {
  try {
    const { id } = req.params
    const { content } = req.body

    const jobNote = await prisma.jobNote.create({
      data: {
        content,
        authorId: req.user.userId,
        jobId: parseInt(id),
      },
    })
    res.status(200).json({ message: "Note added successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export async function completeJob(req, res) {
  const { id } = req.params
  const { parts = [] } = req.body

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Validate parts stock and decrement
      for (const item of parts) {
        const part = await tx.part.findUnique({
          where: { id: item.partId },
        })

        if (!part) {
          throw new Error(`Part with ID ${item.partId} not found`)
        }

        if (part.stock < item.quantity) {
          throw new Error(
            `Not enough stock for ${part.name}. Available: ${part.stock}, requested: ${item.quantity}`
          )
        }

        // Decrement stock
        await tx.part.update({
          where: { id: item.partId },
          data: { stock: { decrement: item.quantity } },
        })

        // Log stock out
        await tx.inventoryLog.create({
          data: {
            partId: item.partId,
            quantity: item.quantity,
            type: "OUT",
          },
        })

        // Record parts used for this job ✅
        await tx.partsUsed.create({
          data: {
            jobId: parseInt(id),
            partId: item.partId,
            quantity: item.quantity,
          },
        })
      }

      // 2. Update job status to COMPLETED
        await tx.job.update({
          where: { id: parseInt(id) },
          data: {
            stage: "COMPLETION",
          },
        })

        // After completing the job, mark assigned technicians available again
        // if they no longer have any other active jobs (stage != COMPLETION)
        const jobWithBooking = await tx.job.findUnique({
          where: { id: parseInt(id) },
          include: { booking: { include: { bookingTechnicians: { select: { technicianId: true } } } } },
        })

        const techIds = (jobWithBooking.booking.bookingTechnicians || []).map((b) => b.technicianId)
        for (const techId of techIds) {
          // Look for any other active job where this technician is assigned via bookingTechnicians
          const active = await tx.job.findFirst({
            where: {
              stage: { not: "COMPLETION" },
              id: { not: parseInt(id) },
              booking: {
                bookingTechnicians: {
                  some: { technicianId: techId },
                },
              },
            },
          })

          if (!active) {
            await tx.user.update({ where: { id: techId }, data: { available: true } })
          }
        }
    })

    res.status(200).json({ message: "Job completed successfully!" })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}