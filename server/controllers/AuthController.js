import bcrypt from "bcryptjs"
import { prisma } from "../server.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

//password hashing
export async function hashingPassword(password) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  return hashedPassword
}

//comparing passwords
export async function comparePassword(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword)

  return isMatch
}

//register
export async function signUp(req, res) {
  const data = req.body

  const { email } = data

  const doesEmailExist = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (doesEmailExist)
    return res.status(400).json({ message: "Email already exists" })

  const doesPhoneExist = await prisma.user.findUnique({
    where: {
      phone: data.phone,
    },
  })

  if (doesPhoneExist)
    return res.status(400).json({ message: "Phone number already exists" })

  const hashPassword = await hashingPassword(data.password)

  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashPassword,
        name: data.name,
        phone: data.phone,
        role: "CUSTOMER",
      },
    })
    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

//login
export async function signIn(req, res) {
  const data = req.body

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) return res.status(400).json({ message: "Invalid Credentials" })

    if (user.blocked)
      return res.status(400).json({
        message:
          "You can no longer access your account please contact the us for more information",
      })

    const doesPasswordMatch = await comparePassword(
      data.password,
      user.password
    )

    if (!doesPasswordMatch)
      return res.status(400).json({ message: "Password Incorrect" })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    })

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

//logout
export function signOut(req, res) {
  res.clearCookie("token")
  res.status(200).json({ message: "User logged out successfully" })
}

//forgot-password
export async function forgotPassword(req, res) {
  const { email } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ message: "User not found" })

  // generate reset token (expires in 15 mins)
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  })

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Booking App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 5 minutes.</p>`,
  })

  res.json({ message: "Reset link sent to your email" })
}

//reset-password
export async function resetPassword(req, res) {
  const { token, password } = req.body

  try {
    // verify token (if expired/invalid, it throws)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // hash new password
    const hashedPassword = await hashingPassword(password)

    // update in DB
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    })

    res.json({ message: "Password reset successful" })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: "Invalid or expired token" })
  }
}

export async function getUser(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.user.userId) },
  })
  if (!user) return res.status(404).json({ message: "User not found" })

  res.status(200).json({ user })
}

export async function getToken(req, res) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: "Unauthorized" })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" })
    res.status(200).json({ token: decoded })
  })
}