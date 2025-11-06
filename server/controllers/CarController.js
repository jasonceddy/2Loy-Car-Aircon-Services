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

    const car = await prisma.car.create({
      data: {
        plateNo,
        brand,
        model,
        year,
        notes,
        ownerId: req.user.userId,
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

  const car = await prisma.car.update({
    where: { id: parseInt(id), ownerId: req.user.userId },
    data: { plateNo, brand, model, year, notes },
  })
  if (!car) return res.status(404).json({ message: "Car not found" })

  res.status(200).json({ message: "Car updated successfully" })
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
