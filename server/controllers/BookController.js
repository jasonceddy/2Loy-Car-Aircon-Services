import { prisma } from "../server.js"

// Helper function to check technician availability
async function checkTechnicianAvailability(
  technicianId,
  scheduledAt,
  excludeBookingId = null
) {
  // New policy: a technician is considered unavailable while they have any active job
  // (job.stage != COMPLETION), regardless of scheduled date. This prevents
  // double-booking across multiple days until the tech marks the job as COMPLETION.
  const existingJob = await prisma.job.findFirst({
    where: {
      booking: {
        technicianId: parseInt(technicianId),
        ...(excludeBookingId && { id: { not: parseInt(excludeBookingId) } }),
      },
      stage: {
        not: "COMPLETION",
      },
    },
    include: {
      booking: {
        include: {
          customer: { select: { name: true } },
          service: { select: { name: true } },
        },
      },
    },
  })

  // Return the conflicting booking (to preserve existing callers' expectations)
  return existingJob ? existingJob.booking : null
}

export async function listChangeRequests(req, res) {
  try {
    const requests = await prisma.bookingChangeRequest.findMany({
      include: {
        booking: {
          include: { customer: true, technician: true }
        },
        requester: true,
      },
      orderBy: { createdAt: "desc" }
    })
    res.status(200).json({ data: requests })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function rejectChangeRequest(req, res) {
  try {
    const changeRequestId = parseInt(req.params.id)
    const reason = req.body?.reason
    const change = await prisma.bookingChangeRequest.findUnique({ where: { id: changeRequestId } })
    if (!change) return res.status(404).json({ message: "Change request not found" })
    await prisma.bookingChangeRequest.update({ where: { id: changeRequestId }, data: { status: "REJECTED", reason: reason || change.reason } })
    // notify customer
    try {
      await prisma.notification.create({
        data: {
          userId: change.requesterId,
          title: "Booking reschedule rejected",
          message: `Your change request for booking #${change.bookingId} was rejected.`,
          meta: { bookingId: change.bookingId, changeRequestId: changeRequestId },
        },
      })
    } catch (e) {
      console.error("Failed to create notification", e)
    }
    res.status(200).json({ message: "Change request rejected" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function createBook(req, res) {
  try {
    const { carId, serviceIds, packIds, scheduledAt, technicianId, servicePreferences } = req.body;
    const userId = req.user.userId; // from auth middleware

    // Server-side schedule validation
    // Special-case: if client requested consult mode, treat scheduledAt as 'now' on the server
    let effectiveScheduledAt = scheduledAt
    if (servicePreferences && servicePreferences.bookingMode === 'consult') {
      effectiveScheduledAt = new Date().toISOString()
    }

    if (effectiveScheduledAt) {
      const sched = new Date(effectiveScheduledAt)
      const now = new Date()

      // If consult mode, we already set to now so skip the 'in the past' check
      if (!(servicePreferences && servicePreferences.bookingMode === 'consult')) {
        if (sched < now) {
          return res.status(400).json({ message: "Scheduled time cannot be in the past" })
        }

        const h = sched.getHours()
        const m = sched.getMinutes()
        if (h < 8 || h > 17 || (h === 17 && m > 0)) {
          return res.status(400).json({ message: "Scheduled time must be between 08:00 and 17:00" })
        }
      }
    }

    // Allow consult-only bookings: if bookingMode is 'consult' we permit no serviceIds/packIds
    if (!serviceIds && !packIds) {
      const isConsultOnly = servicePreferences && servicePreferences.bookingMode === 'consult'
      if (!isConsultOnly) {
        return res
          .status(400)
          .json({ message: "Either serviceIds or packIds must be provided." });
      }
    }

    const createdBookings = []
    if (serviceIds) {
      for (const serviceId of serviceIds) {
        // fetch service to check if customer can pick technician
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
        });
        if (!service) {
          return res.status(404).json({ error: "Service not found" });
        }

        // if customer tried to assign tech but not allowed
        if (!service.allowCustomerTechChoice && technicianId) {
          return res
            .status(400)
            .json({ message: "Technician cannot be chosen for this service" });
        }

        // if customer can choose technician and they provided one, check availability
        if (service.allowCustomerTechChoice && technicianId) {
          const existingBooking = await checkTechnicianAvailability(
            technicianId,
            scheduledAt
          );

          if (existingBooking) {
            return res.status(400).json({
              message: "Technician is not available on the selected date",
            });
          }
        }
        const created = await prisma.booking.create({
          data: {
            customerId: userId,
            carId,
            serviceId: serviceId,
            scheduledAt: new Date(effectiveScheduledAt),
            technicianId: technicianId, // Simplified for now
            ...(servicePreferences !== undefined && { servicePreferences }),
          },
        });
        createdBookings.push(created)
      }
    }

    if (packIds) {
      for (const packId of packIds) {
        // fetch pack and validate technician choice if provided
        const pack = await prisma.pack.findUnique({ where: { id: packId } })
        if (!pack) {
          return res.status(404).json({ error: "Pack not found" })
        }

        if ((pack.allowCustomerTechChoice === false || pack.allowCustomerTechChoice === null) && technicianId) {
          return res.status(400).json({ message: "Technician cannot be chosen for this package" })
        }

        if (pack.allowCustomerTechChoice && technicianId) {
          const existingBooking = await checkTechnicianAvailability(technicianId, effectiveScheduledAt)
          if (existingBooking) {
            return res.status(400).json({ message: "Technician is not available on the selected date" })
          }
        }

        const created = await prisma.booking.create({
          data: {
            customerId: userId,
            carId,
            packId: packId,
            scheduledAt: new Date(effectiveScheduledAt),
            technicianId: technicianId, // Simplified for now
            ...(servicePreferences !== undefined && { servicePreferences }),
          },
        });
        createdBookings.push(created)
      }
    }

      // If this is a consult-only booking (no serviceIds/packIds provided), create a generic booking record
      if (createdBookings.length === 0 && servicePreferences && servicePreferences.bookingMode === 'consult') {
        const created = await prisma.booking.create({
          data: {
            customerId: userId,
            carId,
            scheduledAt: new Date(effectiveScheduledAt),
            ...(servicePreferences !== undefined && { servicePreferences }),
          },
        })
        createdBookings.push(created)
      }

    // If this was a consultation booking, notify all admins so they can see it under /admin/consultations
    try {
      if (servicePreferences && servicePreferences.bookingMode === 'consult' && createdBookings.length > 0) {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
        const notifications = []
        for (const b of createdBookings) {
          for (const a of admins) {
            notifications.push({
              userId: a.id,
              title: `New consultation: Booking #${b.id}`,
              message: `A consultation booking (#${b.id}) was created and requires attention.`,
              meta: { bookingId: b.id },
              read: false,
            })
          }
        }
        if (notifications.length > 0) await prisma.notification.createMany({ data: notifications })
      }
    } catch (notifyErr) {
      console.error('Failed to notify admins about consultation booking', notifyErr)
    }

    res.status(201).json({ message: "Booking created successfully", data: createdBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getBookings(req, res) {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sort = "latest",
      status = "",
    } = req.query

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    // Base where clause based on user role
    let baseWhere = {}
    if (req.user.role === "CUSTOMER") {
      baseWhere.customerId = req.user.userId
    } else if (req.user.role === "TECHNICIAN") {
      baseWhere.technicianId = req.user.userId
    }
    // ADMIN sees all bookings

    // Search filters
    let searchWhere = {}
    if (search) {
      searchWhere = {
        OR: [
          { car: { plateNo: { contains: search } } },
          { car: { brand: { contains: search } } },
          { car: { model: { contains: search } } },
          { service: { name: { contains: search } } },
          { customer: { name: { contains: search } } },
          { customer: { email: { contains: search } } },
          { technician: { name: { contains: search } } },
        ],
      }
    }

    // Status filter
    let statusWhere = {}
    if (status) {
      statusWhere.status = status
    }

    // Combine all where conditions
    const where = {
      ...baseWhere,
      ...searchWhere,
      ...statusWhere,
    }

    // Base sort options (fallback)
    let orderBy
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "scheduled_latest":
        orderBy = { scheduledAt: "desc" }
        break
      case "scheduled_oldest":
        orderBy = { scheduledAt: "asc" }
        break
      case "id_asc":
        orderBy = { id: "asc" }
        break
      case "id_desc":
        orderBy = { id: "desc" }
        break
      case "customer_name":
        orderBy = { customer: { name: "asc" } }
        break
      case "service_name":
        orderBy = { service: { name: "asc" } }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    const [bookings, count] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          car: true,
          service: true,
          pack: true,
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
              available: true,
            },
          },
          bookingTechnicians: {
            include: { technician: { select: { id: true, name: true, email: true, available: true } } }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          jobs: {
            include: {
              notes: {
                include: {
                  author: {
                    select: { name: true },
                  },
                },
              },
              partsUsed: {
                include: {
                  part: true,
                },
              },
            },
          },
          quote: {
            include: {
              billing: {
                include: {
                  payments: true,
                },
              },
            },
          },
          changeRequests: {
            include: {
              requester: {
                select: { id: true, name: true, email: true }
              }
            }
          },
        },
      }),
      prisma.booking.count({ where }),
    ])

    // 🔥 Priority-based sorting with user's sort preference as fallback
    const sorted = bookings.sort((a, b) => {
      // Helper function to determine booking priority
      const getPriority = (booking) => {
        const hasCompletionStage = booking.jobs.some(
          (j) => j.stage === "COMPLETION"
        )
        const hasQuote = !!booking.quote
        const hasBilling = !!booking.quote?.billing
        const isPaid = booking.quote?.billing?.status === "PAID"

        // Priority 1 (Highest): Completed but no quote
        if (hasCompletionStage && !hasQuote) {
          return 1
        }

        // Priority 2: Completed with quote but billing not paid
        if (hasCompletionStage && hasQuote && hasBilling && !isPaid) {
          return 2
        }

        // Priority 3: Pending booking status
        if (booking.status === "PENDING") {
          return 3
        }

        // Priority 4 (Lowest): Everything else (completed & paid, cancelled, rejected, etc.)
        return 4
      }

      const aPriority = getPriority(a)
      const bPriority = getPriority(b)

      // Sort by priority first
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // If same priority, apply user's chosen sort
      switch (sort) {
        case "latest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "scheduled_latest":
          return new Date(b.scheduledAt) - new Date(a.scheduledAt)
        case "scheduled_oldest":
          return new Date(a.scheduledAt) - new Date(b.scheduledAt)
        case "id_asc":
          return a.id - b.id
        case "id_desc":
          return b.id - a.id
        case "customer_name":
          return a.customer.name.localeCompare(b.customer.name)
        case "service_name":
          return a.service.name.localeCompare(b.service.name)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    res.status(200).json({
      data: sorted,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function assignTechnician(req, res) {
  try {
    console.log('[assignTechnician] invoked by user:', req.user?.userId, 'role:', req.user?.role, 'params:', req.params, 'body:', req.body)
    const { id } = req.params // bookingId from URL
    // Accept either a single technicianId or array of technicianIds
    let { technicianId, technicianIds } = req.body
    const techIds = []
    if (technicianIds && Array.isArray(technicianIds)) {
      technicianIds.forEach((t) => techIds.push(parseInt(t)))
    }
    if (technicianId) techIds.push(parseInt(technicianId))

    if (techIds.length === 0) {
      return res.status(400).json({ error: "At least one technician is required" })
    }
    // Get the booking to check its scheduled date
    const existingBooking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      select: { scheduledAt: true },
    })

    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    const assignedTechs = []
    for (const techId of techIds) {
      // availability check per technician
      const conflicting = await checkTechnicianAvailability(techId, existingBooking.scheduledAt, id)
      if (conflicting) {
        return res.status(400).json({
          message: "Technician is not available",
          technicianId: techId,
          conflict: {
            bookingId: conflicting.id,
            serviceName: conflicting.service?.name || null,
            customerName: conflicting.customer?.name || null,
          },
        })
      }

      // create or upsert BookingTechnician entry
      const bt = await prisma.bookingTechnician.create({
        data: {
          bookingId: parseInt(id),
          technicianId: techId,
        },
      })
      assignedTechs.push(bt)

      // mark technician as unavailable
      try {
        await prisma.user.update({ where: { id: techId }, data: { available: false } })
      } catch (e) {
        console.error('Failed to mark technician unavailable', techId, e)
      }

      // notify each technician
      try {
        await prisma.notification.create({
          data: {
            userId: techId,
            title: `Assigned to booking #${id}`,
            message: `You have been assigned to booking #${id}`,
            meta: { bookingId: parseInt(id) },
          },
        })
      } catch (e) {
        console.error('Failed to create notification for technician', techId, e)
      }
    }

    // Optionally set the primary technicianId to the first assigned technician for backward compatibility
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { technicianId: techIds[0] },
      include: { bookingTechnicians: { include: { technician: true } }, technician: true }
    })

    res.status(200).json({ message: "Technicians assigned successfully", data: booking })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function confirmBooking(req, res) {
  try {
    const { id } = req.params
    // Only admins may confirm bookings (defense-in-depth; routes also protect this)
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins may confirm bookings" })
    }
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "CONFIRMED" },
    })

    const job = await prisma.job.create({
      data: {
        bookingId: parseInt(id),
      },
    })

    res.status(200).json({ message: "Booking confirmed successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function cancelBooking(req, res) {
  try {
    const bookingId = parseInt(req.params.id) || req.body.bookingId

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" })
    }

    // Get booking with technicians in one query
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookingTechnicians: true },
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Only owner or admin can cancel
    if (req.user.role === "CUSTOMER") {
      if (booking.customerId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" })
      }

      // Disallow cancellation if any technician has been assigned
      const hasPrimaryTech = booking.technicianId != null
      const hasAssignedTechs = (booking.bookingTechnicians || []).length > 0

      if (hasPrimaryTech || hasAssignedTechs) {
        return res
          .status(400)
          .json({ message: "Booking cannot be cancelled after a technician has been assigned" })
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })

    // Notify technician (if assigned) and admins
    try {
      const actorId = req.user.userId

      if (updated.technicianId && updated.technicianId !== actorId) {
        await prisma.notification.create({
          data: {
            userId: updated.technicianId,
            title: `Booking #${updated.id} cancelled by customer`,
            message: `Booking #${updated.id} has been cancelled.`,
            meta: { bookingId: updated.id, cancelledBy: actorId },
          },
        })
      }

      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } })
      const adminNotifications = admins
        .filter((a) => a.id !== actorId)
        .map((a) => ({
          userId: a.id,
          title: `Booking #${updated.id} cancelled`,
          message: `Booking #${updated.id} was cancelled by the customer.`,
          meta: { bookingId: updated.id, cancelledBy: actorId },
          read: false,
        }))

      if (adminNotifications.length > 0) {
        await prisma.notification.createMany({ data: adminNotifications })
      }
    } catch (e) {
      console.error("Failed to create cancel notifications", e)
    }

    res.status(200).json({ message: "Booking cancelled successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}


// Update booking (customer can edit notes/preferences before booking starts or before confirmed)
export async function updateBooking(req, res) {
  try {
    const bookingId = parseInt(req.params.id)
    const { customerNotes, servicePreferences } = req.body

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return res.status(404).json({ message: "Booking not found" })

    // Only owner or admin can update
    if (req.user.role === 'CUSTOMER' && booking.customerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' })
    }

    // Prevent edits if booking already started (scheduledAt in the past) or booking is CANCELLED/REJECTED
    const now = new Date()
    if (new Date(booking.scheduledAt) <= now) {
      return res.status(400).json({ message: 'Cannot edit a booking that already started or passed' })
    }

    // Only allow edits when booking is not CANCELLED or REJECTED
    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
      return res.status(400).json({ message: 'Cannot edit cancelled or rejected booking' })
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(customerNotes !== undefined && { customerNotes }),
        ...(servicePreferences !== undefined && { servicePreferences }),
      }
    })

    // Notify assigned technician and admins that the customer updated booking details
    try {
      const actorId = req.user.userId

      // notify technician if assigned and not the actor
      if (updated.technicianId && updated.technicianId !== actorId) {
        await prisma.notification.create({
          data: {
            userId: updated.technicianId,
            title: `Booking #${updated.id} updated by customer`,
            message: `Customer updated notes or preferences for booking #${updated.id}.`,
            meta: { bookingId: updated.id, updatedBy: actorId },
          },
        })
      }

      // notify all admins (exclude actor)
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
      const adminNotifications = admins
        .filter(a => a.id !== actorId)
        .map(a => ({
          userId: a.id,
          title: `Booking #${updated.id} updated`,
          message: `Booking #${updated.id} was updated by the customer.`,
          meta: { bookingId: updated.id, updatedBy: actorId },
          read: false,
        }))

      if (adminNotifications.length > 0) {
        // Use createMany for efficiency
        await prisma.notification.createMany({ data: adminNotifications })
      }
    } catch (notifyErr) {
      console.error('Failed to create notifications for booking update', notifyErr)
    }

    res.status(200).json({ message: 'Booking updated', data: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

export async function rescheduleBooking(req, res) {
  try {
    const { bookingId, scheduledAt } = req.body
    // validate scheduledAt
    if (scheduledAt) {
      const sched = new Date(scheduledAt)
      const now = new Date()
      if (sched < now) {
        return res.status(400).json({ message: "Scheduled time cannot be in the past" })
      }

      const h = sched.getHours()
      const m = sched.getMinutes()
      if (h < 8 || h > 17 || (h === 17 && m > 0)) {
        return res.status(400).json({ message: "Scheduled time must be between 08:00 and 17:00" })
      }
    }
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { scheduledAt: new Date(scheduledAt) },
    })
    res.status(200).json({ message: "Booking rescheduled successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function rejectBooking(req, res) {
  try {
    const { id } = req.params
    const { reason } = req.body
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "REJECTED", rejectReason: reason },
    })
    // Notify the booking customer about the rejection (safe, best-effort)
    try {
      if (booking && booking.customerId) {
        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            title: `Booking #${booking.id} rejected`,
            message: reason || `Your booking #${booking.id} was rejected by the admin.`,
            meta: { bookingId: booking.id },
            read: false,
          },
        })
      }
    } catch (notifyErr) {
      console.error('Failed to notify customer about rejection', notifyErr)
    }

    res.status(200).json({ message: "Booking rejected successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

// Customer creates a change request for a booking
export async function createChangeRequest(req, res) {
  try {
    const bookingId = parseInt(req.params.id)
    const { requestedAt, reason } = req.body
    const requesterId = req.user.userId

    // Basic validation
    if (!requestedAt) {
      return res.status(400).json({ message: "requestedAt is required" })
    }

    // ensure booking exists and belongs to requester (unless admin)
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return res.status(404).json({ message: "Booking not found" })
    if (req.user.role === "CUSTOMER" && booking.customerId !== requesterId) {
      return res.status(403).json({ message: "Not authorized to request changes for this booking" })
    }

    const sched = new Date(requestedAt)
    const now = new Date()
    if (sched < now) return res.status(400).json({ message: "Requested time cannot be in the past" })
    const h = sched.getHours(); const m = sched.getMinutes();
    if (h < 8 || h > 17 || (h === 17 && m > 0)) {
      return res.status(400).json({ message: "Requested time must be between 08:00 and 17:00" })
    }

    const change = await prisma.bookingChangeRequest.create({
      data: {
        bookingId: bookingId,
        requesterId: requesterId,
        requestedAt: sched,
        reason: reason || null,
      },
    })

    res.status(201).json({ message: "Change request created", data: change })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

// Admin approves a change request and applies it to the booking
export async function approveChangeRequest(req, res) {
  try {
    const bookingId = parseInt(req.params.id)
    const { changeRequestId } = req.body

    if (!changeRequestId) return res.status(400).json({ message: "changeRequestId is required" })

    const change = await prisma.bookingChangeRequest.findUnique({ where: { id: parseInt(changeRequestId) } })
    if (!change) return res.status(404).json({ message: "Change request not found" })

    if (change.bookingId !== bookingId) {
      return res.status(400).json({ message: "Change request does not belong to this booking" })
    }

    // Check technician availability (if booking has technician assigned)
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return res.status(404).json({ message: "Booking not found" })
    if (booking.technicianId) {
      const conflicting = await checkTechnicianAvailability(booking.technicianId, change.requestedAt, bookingId)
      if (conflicting) {
        return res.status(400).json({ message: `Technician not available on the requested date (${conflicting.service?.name} with ${conflicting.customer?.name})` })
      }
    }

    // Update booking scheduledAt and return the updated booking
    const updatedBooking = await prisma.booking.update({ where: { id: bookingId }, data: { scheduledAt: change.requestedAt },
      include: {
        car: true,
        service: true,
        pack: true,
        technician: { select: { id: true, name: true, email: true } },
        bookingTechnicians: { include: { technician: { select: { id: true, name: true, email: true } } } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        jobs: { include: { notes: { include: { author: { select: { name: true } } } }, partsUsed: { include: { part: true } } } },
        quote: { include: { billing: { include: { payments: true } } } },
        changeRequests: { include: { requester: { select: { id: true, name: true, email: true } } } },
      }
    })

    // mark change request approved
    await prisma.bookingChangeRequest.update({ where: { id: change.id }, data: { status: "APPROVED" } })

    // Create notification for the booking customer
    try {
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: "Booking reschedule approved",
          message: `Your booking #${bookingId} has been rescheduled to ${new Date(change.requestedAt).toLocaleString()}`,
          meta: { bookingId, changeRequestId: change.id },
        },
      })
    } catch (e) {
      console.error("Failed to create notification", e)
    }

    // Create notification for the booking customer
    try {
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: "Booking reschedule approved",
          message: `Your booking #${bookingId} has been rescheduled to ${new Date(change.requestedAt).toLocaleString()}`,
          meta: { bookingId, changeRequestId: change.id },
        },
      })
    } catch (e) {
      console.error("Failed to create notification", e)
    }

    res.status(200).json({ message: "Change request approved and booking updated", data: updatedBooking })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}
