import { prisma } from "../server.js";

// Get all packs with search, pagination, and sorting
export async function getAllPacks(req, res) {
  try {
    const { search = "", page = 1, limit = 10, sort = "id_desc" } = req.query;

    const isCustomer = req.user.role === "CUSTOMER";
    const pageNumber = parseInt(page); // Default to 1 if no page is provided
    const pageSize = isCustomer ? undefined : parseInt(limit); // Allow dynamic page sizes for admins
    const skip = isCustomer ? 0 : (pageNumber - 1) * parseInt(limit); // Skip calculated based on page

    // Search filters
    let where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    // Hide hidden packs from customers
    if (isCustomer) {
      where = { ...where, hidden: false };
    }

    // Sorting options
    let orderBy;
    switch (sort) {
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "id_asc":
        orderBy = { id: "asc" };
        break;
      case "id_desc":
        orderBy = { id: "desc" };
        break;
      default:
        orderBy = { id: "desc" };
    }

    // Fetching packs with pagination and services
    const [packs, count] = await prisma.$transaction([
      prisma.pack.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          services: true, // Include services linked to the pack
        },
      }),
      prisma.pack.count({ where }),
    ]);

    // Return paginated response
    res.status(200).json({
      data: packs,
      count,
      page: isCustomer ? 1 : pageNumber,
      pageSize: isCustomer ? count : parseInt(limit),
      totalPages: isCustomer ? 1 : Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching packs:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Create a new pack
export async function createPack(req, res) {
  const { name, price, description, serviceIds, hidden, allowCustomerTechChoice } =
    req.body;

  try {
    const pack = await prisma.pack.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        hidden: hidden || false,
        allowCustomerTechChoice: allowCustomerTechChoice || false,
        services: {
          connect: serviceIds.map(id => ({ id: parseInt(id) })), // Link to services by their IDs
        },
      },
      include: {
        services: true, // Return associated services
      },
    });
    res.status(201).json({ message: "Pack created successfully", data: pack });
  } catch (error) {
    console.error("Error creating pack:", error);
    res.status(500).json({ message: "Failed to create pack" });
  }
}

// Update an existing pack
export async function updatePack(req, res) {
  const { id } = req.params;
  const { name, price, description, serviceIds, hidden, allowCustomerTechChoice } =
    req.body;

  try {
    const data = {
      name,
      price: parseFloat(price),
      description,
      hidden,
      allowCustomerTechChoice,
    };

    if (serviceIds) {
      data.services = {
        set: serviceIds.map(id => ({ id: parseInt(id) })), // Replace services associated with the pack
      };
    }

    const pack = await prisma.pack.update({
      where: { id: parseInt(id) },
      data,
      include: { services: true },
    });

    if (!pack) return res.status(404).json({ message: "Pack not found" });
    res.status(200).json({ message: "Pack updated successfully", data: pack });
  } catch (error) {
    console.error("Error updating pack:", error);
    res.status(500).json({ message: "Failed to update pack" });
  }
}

// Delete a pack
export async function deletePack(req, res) {
  const { id } = req.params;

  try {
    const pack = await prisma.pack.delete({
      where: { id: parseInt(id) },
    });

    if (!pack) return res.status(404).json({ message: "Pack not found" });
    res.status(200).json({ message: "Pack deleted successfully" });
  } catch (error) {
    console.error("Error deleting pack:", error);
    res.status(500).json({ message: "Failed to delete pack" });
  }
}

// Get a single pack by its ID
export async function getPackById(req, res) {
  const { id } = req.params;

  try {
    const pack = await prisma.pack.findUnique({
      where: { id: parseInt(id) },
      include: { services: true }, // Include services linked to the pack
    });

    if (!pack) return res.status(404).json({ message: "Pack not found" });

    res.status(200).json(pack);
  } catch (error) {
    console.error("Error fetching pack:", error);
    res.status(500).json({ message: "Failed to fetch pack" });
  }
}

// Toggle visibility (hide/unhide pack)
export async function togglePackVisibility(req, res) {
  const { id } = req.params;

  try {
    const pack = await prisma.pack.update({
      where: { id: parseInt(id) },
      data: { hidden: { set: !req.body.hidden } }, // Toggle the visibility (hidden: true/false)
    });

    res.status(200).json({
      message: pack.hidden ? "Pack is now hidden" : "Pack is now visible",
      data: pack,
    });
  } catch (err) {
    console.error("Error toggling pack visibility:", err);
    res.status(500).json({ message: "Failed to toggle visibility" });
  }
}
