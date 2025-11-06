import { comparePassword, hashingPassword } from "./AuthController.js"
import { prisma } from "../server.js"
import bcrypt from "bcryptjs"
export async function getTechnicians(req, res) {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: "TECHNICIAN" },
      select: { id: true, name: true, email: true, phone: true, blocked: true },
    })

    // compute availability dynamically based on active jobs
    const techsWithAvailability = await Promise.all(
      technicians.map(async (t) => {
        const activeJobs = await prisma.job.count({
          where: {
            stage: { not: "COMPLETION" },
            OR: [
              { booking: { technicianId: t.id } },
              { booking: { bookingTechnicians: { some: { technicianId: t.id } } } },
            ],
          },
        })
        return { ...t, available: activeJobs === 0 }
      })
    )

    res.status(200).json({ technicians: techsWithAvailability })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// 1. Users List - All customers with status (User or Customer)
export async function getUsers(req, res) {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sort = "latest",
      status = "", // New status filter
    } = req.query

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    // Search filters - name, email, phone
    let searchWhere = {}
    if (search) {
      searchWhere = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    }

    // Status filter - filter by booking count
    let statusWhere = {}
    if (status === "User") {
      statusWhere = {
        bookings: {
          none: {}, // Users with no bookings
        },
      }
    } else if (status === "Customer") {
      statusWhere = {
        bookings: {
          some: {}, // Users with at least one booking
        },
      }
    }

    // Base where clause for all users (admins, technicians, customers, new accounts)
    // Allow optional role filtering via `status` query param (e.g., ADMIN, TECHNICIAN, CUSTOMER)
    let where = {
      ...searchWhere,
      ...statusWhere,
    }

    if (status) {
      // normalize to uppercase roles if caller passes role names
      where.role = status.toUpperCase()
    }

    // Sort options
    let orderBy
    switch (sort) {
      case "latest":
        orderBy = { id: "desc" }
        break
      case "oldest":
        orderBy = { id: "asc" }
        break
      default:
        orderBy = { id: "desc" }
    }

    const [users, count] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          blocked: true,
          _count: {
            select: {
              cars: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // Add status field based on booking count for backward compatibility
    const usersWithStatus = users.map((user) => ({
      ...user,
      status: user.role || (user._count.bookings > 0 ? "Customer" : "User"),
    }))

    res.status(200).json({
      data: usersWithStatus,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// 2. Technicians List - All users with TECHNICIAN role
export async function getAllTechnicians(req, res) {
  try {
    const { search = "", page = 1, limit = 10, sort = "latest" } = req.query

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    // Search filters - name, email, phone
    let searchWhere = {}
    if (search) {
      searchWhere = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    }

    // Base where clause for technicians
    const where = {
      role: "TECHNICIAN",
      ...searchWhere,
    }

    // Sort options
    let orderBy
    switch (sort) {
      case "latest":
        orderBy = { id: "desc" }
        break
      case "oldest":
        orderBy = { id: "asc" }
        break
      default:
        orderBy = { id: "desc" }
    }

    const [technicians, count] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          blocked: true,
          _count: {
            select: {
              techAssignments: true, // Count of assigned bookings
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // compute availability for the page of technicians
    const techniciansWithAvailability = await Promise.all(
      technicians.map(async (t) => {
        const activeJobs = await prisma.job.count({
          where: {
            stage: { not: "COMPLETION" },
            OR: [
              { booking: { technicianId: t.id } },
              { booking: { bookingTechnicians: { some: { technicianId: t.id } } } },
            ],
          },
        })
        return { ...t, available: activeJobs === 0 }
      })
    )

    res.status(200).json({
      data: techniciansWithAvailability,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}
export async function createUser(req, res) {
  try {
    const { name, email, phone, role } = req.body

    // check duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } })
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" })
    }

    // 🔑 force password to secret1234
    const hashedPassword = await bcrypt.hash("secret1234", 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,   // hashed secret1234
        role: role || "TECHNICIAN", // default TECHNICIAN
        blocked: false,
      },
    })

    res.status(201).json({ message: "Technician created", user: newUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
//Update User
export async function updateMe(req, res) {
  try {
    const userId = req.user.userId; // from your token payload
    const { name, email, phone } = req.body;

    // fetch current user
    const me = await prisma.user.findUnique({ where: { id: userId } });
    if (!me) return res.status(404).json({ message: "User not found" });

    // unique checks only if changing
    if (email && email !== me.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) return res.status(400).json({ message: "Email already exists" });
    }
    if (phone && phone !== me.phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) return res.status(400).json({ message: "Phone number already exists" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
    });

    return res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
// 3. Customers List - All users that have booked something
export async function getCustomers(req, res) {
  try {
    const { search = "", page = 1, limit = 10, sort = "latest" } = req.query

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    // Search filters - name, email, phone
    let searchWhere = {}
    if (search) {
      searchWhere = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    }

    // Base where clause for customers (CUSTOMER role) with at least one booking
    const where = {
      role: "CUSTOMER",
      bookings: {
        some: {}, // Users with at least one booking
      },
      ...searchWhere,
    }

    // Sort options
    let orderBy
    switch (sort) {
      case "latest":
        orderBy = { id: "desc" }
        break
      case "oldest":
        orderBy = { id: "asc" }
        break
      default:
        orderBy = { id: "desc" }
    }

    const [customers, count] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          blocked: true,
          _count: {
            select: {
              bookings: true,
              cars: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    res.status(200).json({
      data: customers,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// Edit User
export async function editUser(req, res) {
  try {
    const { id } = req.params
    const { name, email, phone } = req.body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" })
      }
    }

    // Check if phone is already taken by another user
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      })
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already exists" })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        blocked: true,
      },
    })

    res.status(200).json({
      message: "User updated successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function editOwnDetails(req, res) {
  const id = req.user.userId
  if (!id) {
    return res.status(401).json({ message: "User not authenticated" })
  }

  const { name, email, phone } = req.body

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
    },
  })

  res.status(200).json({
    message: "User updated successfully",
  })
}

export async function verifyPassword(req, res) {
  const id = req.user.userId

  const { current_password } = req.body

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const isPasswordValid = await comparePassword(current_password, user.password)

  res.status(200).json({ isPasswordValid })
}

export async function changePassword(req, res) {
  const id = req.user.userId
  const { new_password } = req.body

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const hashedPassword = await hashingPassword(new_password)

  await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      password: hashedPassword,
    },
  })

  res.status(200).json({ message: "Password changed successfully" })
}

// Block User
export async function blockUser(req, res) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.blocked) {
      return res.status(400).json({ message: "User is already blocked" })
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { blocked: true },
      select: {
        id: true,
        name: true,
        email: true,
        blocked: true,
      },
    })

    res.status(200).json({
      message: "User blocked successfully",
      user: updatedUser,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// Unblock User
export async function unblockUser(req, res) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.blocked) {
      return res.status(400).json({ message: "User is not blocked" })
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { blocked: false },
      select: {
        id: true,
        name: true,
        email: true,
        blocked: true,
      },
    })

    res.status(200).json({
      message: "User unblocked successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}

// Delete User
export async function deleteUser(req, res) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookings: true,
        techAssignments: true,
        cars: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user has any bookings or tech assignments
    if (user.bookings.length > 0 || user.techAssignments.length > 0) {
      return res.status(400).json({
        message: "Cannot delete user with existing bookings or assignments",
        details: {
          bookings: user.bookings.length,
          techAssignments: user.techAssignments.length,
        },
      })
    }

    // Delete user (this will cascade delete cars if properly set up)
    await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    res.status(200).json({
      message: "User deleted successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
  }
}