import bcrypt from "bcryptjs"
import { prisma } from "../server.js"
import jwt from "jsonwebtoken"

//check if user is authenticated
export const authenticateUser = (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Unauthorized" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired, please log in again" })
    }
    return res.status(403).json({ message: "Invalid token" })
  }
}

//check if user role has permission
export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" })

    next()
  }
}
