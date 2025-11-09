import { prisma } from "../server.js"

//create car
export async function createCar(req, res) {
  try {
    const { plateNo, brand, model, year, notes } = req.body

    const doesPlateNoExist = await prisma.car.findUnique({
      where: {
        plateNo,
      },
    })
    if (doesPlateNoExist)
      return res.status(400).json({ message: "Plate number already exists" })

    const now = new Date()

    const car = await prisma.car.create({
      data: {
        plateNo,
        brand,
        model,
        year,
        notes,
        ownerId: req.user.userId,
        ownerChangedAt: now,
      },
    })

    // create initial ownership period (use same timestamp as car ownerChangedAt)
    await prisma.carOwnership.create({
      data: {
        carId: car.id,
        ownerId: req.user.userId,
        fromDate: now,
      },
    })

    res.status(201).json({ message: "Car created successfully" })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

//get all cars
export async function getAllCars(req, res) {
  try {
    const { search = "", page = 1, limit = 10, sort = "id_desc" } = req.query

    const pageNumber = parseInt(page) //if no page is provided, default to 1
    const pageSize = parseInt(limit) //limit will always be 25
    const skip = (pageNumber - 1) * pageSize //how much data would we skip per page

    //filters
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

    //search filters
    const where = search
      ? {
          OR: [
            { brand: { contains: search } },
            { model: { contains: search } },
            { plateNo: { contains: search } },
          ],
        }
      : {}

    const [cars, count] = await prisma.$transaction([
      prisma.car.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
      }),
      prisma.car.count({ where }),
    ])

    res.status(200).json({
      data: cars,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

//get my car
export async function getMyCars(req, res) {
  try {
    const { search = "", page = 1, limit = 10, sort = "id_desc" } = req.query

    const pageNumber = parseInt(page) //if no page is provided, default to 1
    const pageSize = parseInt(limit) //limit will always be 25
    const skip = (pageNumber - 1) * pageSize //how much data would we skip per page

    //filters
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

    // Search filters
    const where = {
      ownerId: req.user.userId, // always filter by owner
      ...(search
        ? {
            OR: [
              { brand: { contains: search } },
              { model: { contains: search } },
              { plateNo: { contains: search } },
              { year: { contains: search } },
              { notes: { contains: search } },
            ],
          }
        : {}),
    }

    const [cars, count] = await prisma.$transaction([
      prisma.car.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
      }),
      prisma.car.count({ where }),
    ])

    res.status(200).json({
      data: cars,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

//update car
export async function updateCar(req, res) {
  const { id } = req.params
  const { plateNo, brand, model, year, notes } = req.body

  // update non-ownership fields only
  const car = await prisma.car.update({
    where: { id: parseInt(id), ownerId: req.user.userId },
    data: { plateNo, brand, model, year, notes },
  })
  if (!car) return res.status(404).json({ message: "Car not found" })

  res.status(200).json({ message: "Car updated successfully" })
}

// Transfer car ownership without touching service/bookings history
export async function transferCarOwnership(req, res) {
  try {
    const { id } = req.params
    const { newOwnerId, moveOpenJobs = false, moveUnpaidInvoices = false, transferDate } = req.body

    if (!newOwnerId || isNaN(parseInt(newOwnerId))) {
      return res.status(400).json({ message: "newOwnerId is required and must be a number" })
    }

    const carId = parseInt(id)

    const car = await prisma.car.findUnique({ where: { id: carId } })
    if (!car) return res.status(404).json({ message: "Car not found" })

    // Only admins may perform transfers (owners cannot self-transfer here)
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins may transfer car ownership" })
    }

    // Ensure the new owner exists
    const newOwner = await prisma.user.findUnique({ where: { id: parseInt(newOwnerId) } })
    if (!newOwner) return res.status(404).json({ message: "New owner not found" })

    // Use a transaction to close any previous open ownership periods and create a new one
    // using the exact same timestamp to avoid overlaps.
    // allow admin to specify an effective transfer date; default to now
    let now = new Date()
    if (transferDate) {
      const parsed = new Date(transferDate)
      if (!isNaN(parsed.getTime())) {
        now = parsed
      }
    }
    // Validate that the requested transfer date will not create overlapping ownership periods.
    // An overlap exists if there is any ownership record for this car where
    // ownership.fromDate <= transferDate AND (ownership.toDate IS NULL OR ownership.toDate > transferDate).
    // We allow an existing open ownership (toDate == null) only when it's the current one being closed
    // on the same transfer instant; any other ownership that includes the transfer instant is a conflict.
    const overlapping = await prisma.carOwnership.findFirst({
      where: {
        carId,
        AND: [
          { fromDate: { lte: now } },
          {
            OR: [
              { toDate: null },
              { toDate: { gt: now } },
            ],
          },
        ],
      },
    })

    if (overlapping) {
      return res.status(400).json({ message: 'Transfer date would create overlapping ownership period. Please provide a valid transferDate that does not overlap existing ownerships.' })
    }

    // Guard: if plateNo (or vin, if present in schema) is duplicated on another car record,
    // abort the transfer and ask the admin to fix identifiers first. This prevents accidentally
    // transferring a car that shares identifiers with another record.
    const duplicateWhere = {
      AND: [
        { id: { not: carId } },
        { OR: [] }
      ]
    }
    // always check plateNo (schema defines plateNo)
    duplicateWhere.AND[1].OR.push({ plateNo: car.plateNo })
    // If a vin field exists on the car object (some deployments may have extended schema), check it too
    if (car.vin) {
      duplicateWhere.AND[1].OR.push({ vin: car.vin })
    }

    const duplicate = await prisma.car.findFirst({ where: duplicateWhere })
    if (duplicate) {
      return res.status(400).json({ message: 'Duplicate plate number or VIN detected on another car record. Please correct the identifiers before attempting the transfer.' })
    }
    let movedJobsCount = 0
    let movedInvoicesCount = 0
  let movedBookingIds = []
  let movedQuoteIds = []

  let createdTransferLog = null
  // Use optimistic concurrency based on the car.ownerChangedAt timestamp. If another admin
  // modified the owner in-between the admin reading the car and attempting to transfer,
  // the conditional update below will affect 0 rows and we'll abort with a 409 requesting a refresh.
  const originalOwnerChangedAt = car.ownerChangedAt || null

  await prisma.$transaction(async (tx) => {
    // Try to atomically update the Car row only if ownerChangedAt matches the value we read earlier.
    // This prevents two admins from concurrently performing transfers; the second will see 0 rows
    // affected and we'll return a conflict response.
    const updateResult = await tx.car.updateMany({
      where: { id: carId, ownerChangedAt: originalOwnerChangedAt },
      data: { ownerId: parseInt(newOwnerId), ownerChangedAt: now },
    })

    if (!updateResult || updateResult.count === 0) {
      // Throw a special error to abort the transaction and surface a 409 later
      const e = new Error('CONFLICT_OWNER_CHANGED')
      e.code = 'CONFLICT_OWNER_CHANGED'
      throw e
    }

    // Close all open ownership periods for this car (toDate == null)
    await tx.carOwnership.updateMany({ where: { carId, toDate: null }, data: { toDate: now } })

    // If there are no ownership records yet for this car, create the first one for audit completeness
    const existingOwnershipCount = await tx.carOwnership.count({ where: { carId } })
    if (existingOwnershipCount === 0) {
      // create one for the previous owner (if present) so history is complete
      if (car.ownerId) {
        await tx.carOwnership.create({ data: { carId, ownerId: car.ownerId, fromDate: car.ownerChangedAt || now } })
      }
    }

    // Create new ownership period that starts at the effective transfer instant
    await tx.carOwnership.create({ data: { carId, ownerId: parseInt(newOwnerId), fromDate: now } })

    // If admin requested, reassign open bookings (or bookings with open jobs) to the new owner
      if (moveOpenJobs) {
        // Bookings where status is pending/confirmed OR that have any job not in COMPLETION
        const bookingsToMove = await tx.booking.findMany({
          where: {
            carId,
            OR: [
              { status: { in: ["PENDING", "CONFIRMED"] } },
              { jobs: { some: { stage: { not: "COMPLETION" } } } },
            ],
          },
          select: { id: true },
        })

        if (bookingsToMove.length > 0) {
          movedJobsCount = bookingsToMove.length
          movedBookingIds = bookingsToMove.map((b) => b.id)
          await tx.booking.updateMany({ where: { id: { in: movedBookingIds } }, data: { customerId: parseInt(newOwnerId) } })
        }
      }

      // If admin requested, reassign unpaid invoices (quotes with billing.status == UNPAID)
      if (moveUnpaidInvoices) {
        // Only move unpaid invoices that belong to open/active bookings.
        // We must not reassign historical/completed service records or their billing info
        // so that past payments remain attributed to the original payer.
        const quotesToMove = await tx.quote.findMany({
          where: {
            billing: { is: { status: "UNPAID" } },
            booking: {
              carId,
              OR: [
                { status: { in: ["PENDING", "CONFIRMED"] } },
                { jobs: { some: { stage: { not: "COMPLETION" } } } },
              ],
            },
          },
          select: { id: true },
        })

        if (quotesToMove.length > 0) {
          movedInvoicesCount = quotesToMove.length
          movedQuoteIds = quotesToMove.map((q) => q.id)
          await tx.quote.updateMany({ where: { id: { in: movedQuoteIds } }, data: { customerId: parseInt(newOwnerId) } })
        }
      }

  // Update car record to reflect current owner (convenience field)
  await tx.car.update({ where: { id: carId }, data: { ownerId: parseInt(newOwnerId), ownerChangedAt: now } })

      // Create a transfer log for audit (who performed the transfer) and record admin decisions
      createdTransferLog = await tx.transferLog.create({
        data: {
          carId,
          adminId: req.user.userId,
          previousOwnerId: car.ownerId || null,
          newOwnerId: parseInt(newOwnerId),
          reason: req.body.reason || null,
          moveOpenJobs: Boolean(moveOpenJobs),
          moveUnpaidInvoices: Boolean(moveUnpaidInvoices),
          movedJobsCount: movedJobsCount || null,
          movedInvoicesCount: movedInvoicesCount || null,
          // store the effective transfer date and lists of moved ids for audit
          details: {
            transferDate: now,
            movedBookingIds: movedBookingIds.length ? movedBookingIds : null,
            movedQuoteIds: movedQuoteIds.length ? movedQuoteIds : null,
            transferRequestedAt: new Date(),
          },
          createdAt: now,
        },
      })
    })

  // Create notifications to record the admin's decision for both previous and new owner
    try {
      const prevId = car.ownerId || null
      const adminId = req.user.userId
      const notifications = []
      if (prevId) {
        notifications.push({
          userId: prevId,
          title: `Car #${car.id} transferred`,
          message: `Your vehicle (plate ${car.plateNo}) was transferred to ${newOwner.name}. Admin moved ${movedJobsCount} open booking(s) and ${movedInvoicesCount} unpaid invoice(s) as requested.`,
          meta: { carId, transferBy: adminId, movedBookingIds, movedQuoteIds },
          read: false,
        })
      }

      // Notify the new owner
      notifications.push({
        userId: parseInt(newOwnerId),
        title: `You are now owner of car #${car.id}`,
        message: `You were made the owner of vehicle (plate ${car.plateNo}) by admin ${req.user.userId}. ${movedJobsCount} open booking(s) and ${movedInvoicesCount} unpaid invoice(s) were moved to you as requested.`,
        meta: { carId, transferBy: adminId, movedBookingIds, movedQuoteIds },
        read: false,
      })

      if (notifications.length > 0) await prisma.notification.createMany({ data: notifications })
    } catch (e) {
      console.error('Failed to create transfer notifications', e)
    }

    res.status(200).json({
      message: "Car ownership transferred successfully",
      transferLogId: createdTransferLog ? createdTransferLog.id : null,
      movedBookingIds,
      movedQuoteIds,
      movedJobsCount,
      movedInvoicesCount,
    })
  } catch (error) {
    console.error(error)
    if (error && (error.code === 'CONFLICT_OWNER_CHANGED' || error.message === 'CONFLICT_OWNER_CHANGED')) {
      return res.status(409).json({ message: 'Ownership was modified by another admin. Please refresh and try again.' })
    }
    res.status(500).json({ message: "Failed to transfer ownership" })
  }
}

export async function getCarHistory(req, res) {
  try {
    const { id } = req.params
    const carId = parseInt(id)
    // Get car to determine current owner (so we can apply privacy rules)
    const car = await prisma.car.findUnique({ where: { id: carId }, select: { ownerId: true } })

    if (!car) return res.status(404).json({ message: 'Car not found' })

    const requesterId = req.user && req.user.userId
    const isAdmin = req.user && req.user.role === 'ADMIN'

    // Only allow admins or the current owner to fetch full history
    if (!isAdmin && car.ownerId !== requesterId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const bookings = await prisma.booking.findMany({
      where: { carId },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
      include: {
        id: true,
        car: { include: { owner: { select: { id: true, name: true, email: true, phone: true } } } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, cost: true } },
        pack: { select: { id: true, name: true, price: true } },
        technician: { select: { id: true, name: true } },
        jobs: {
          include: {
            notes: { include: { author: { select: { id: true, name: true } } } },
            partsUsed: { include: { part: true } },
          },
        },
        // include quote.customer so we can show billing parties but mask personal data when required
        quote: { include: { billing: true, customer: { select: { id: true, name: true, email: true, phone: true } } } },
        status: true,
        scheduledAt: true,
        createdAt: true,
      },
    })

    // Also include ownership timeline for this car so the UI can show a clean handoff
    const ownerships = await prisma.carOwnership.findMany({
      where: { carId },
      orderBy: { fromDate: 'desc' },
      include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
    })

    // Privacy: mask prior owners' personal contact info (email/phone) unless the requester
    // is the same user or an ADMIN. We keep names where available so the history remains readable.

    // Mask booking customer and quote customer contact fields when necessary
    const maskedBookings = bookings.map((b) => {
      const booking = JSON.parse(JSON.stringify(b)) // deep clone

      // If the booking customer is not the requester and requester is not admin,
      // hide email and phone
      if (booking.customer && booking.customer.id !== requesterId && !isAdmin) {
        booking.customer.email = null
        booking.customer.phone = null
      }

      // Quote billing party (customer who was billed) - mask their contact info the same way
      if (booking.quote && booking.quote.customer) {
        if (booking.quote.customer.id !== requesterId && !isAdmin) {
          booking.quote.customer.email = null
          booking.quote.customer.phone = null
        }
      }

      // Also for the included car.owner under each booking, mask contact details if not allowed
      if (booking.car && booking.car.owner && booking.car.owner.id !== requesterId && !isAdmin) {
        booking.car.owner.email = null
        booking.car.owner.phone = null
      }

      return booking
    })

    const maskedOwnerships = ownerships.map((o) => {
      const ownership = JSON.parse(JSON.stringify(o))
      if (ownership.owner && ownership.owner.id !== requesterId && !isAdmin) {
        ownership.owner.email = null
        ownership.owner.phone = null
      }
      return ownership
    })

    res.status(200).json({ data: maskedBookings, ownerships: maskedOwnerships, carOwnerId: car ? car.ownerId : null })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch car history' })
  }
}

export async function getCarTransfers(req, res) {
  try {
    const { id } = req.params
    const carId = parseInt(id)
    const logs = await prisma.transferLog.findMany({
      where: { carId },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        previousOwner: { select: { id: true, name: true, email: true } },
        newOwner: { select: { id: true, name: true, email: true } },
      },
    })

    res.status(200).json({ data: logs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch transfer logs' })
  }
}

//delete car
// delete car
export async function deleteCar(req, res) {
  const { id } = req.params
  const carId = parseInt(id)

  // 1. Check if car exists and belongs to the user
  const car = await prisma.car.findFirst({
    where: { id: carId, ownerId: req.user.userId },
  })

  if (!car) {
    return res.status(404).json({ message: "Car not found" })
  }

  // 2. Check if car has upcoming bookings
  const now = new Date()
  const hasUpcomingBooking = await prisma.booking.findFirst({
    where: {
      carId,
      scheduledAt: { gte: new Date() }, // booking starts in the future
      status: { in: ["PENDING", "CONFIRMED"] }, // only count active bookings
    },
  })

  if (hasUpcomingBooking) {
    return res.status(400).json({
      message: "Car cannot be deleted because it has upcoming bookings",
    })
  }

  // 3. Safe to delete
  await prisma.car.delete({
    where: { id: carId },
  })

  res.status(200).json({ message: "Car deleted successfully" })
}
